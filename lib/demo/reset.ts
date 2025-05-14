import type { PrismaClient } from "@prisma/client";
import {
  DEMO_BOARD,
  DEMO_CATEGORIES,
  DEMO_EMAIL,
  DEMO_OWNER_NAME,
  DEMO_POSTS,
  DEMO_VOTERS,
} from "@/lib/demo/data";

const DAY = 86_400_000;
const HOUR = 3_600_000;

// Restores the guest demo workspace to its sample state: board settings, posts,
// votes and comments. Anything a guest changed is discarded.
export async function resetDemoWorkspace(db: PrismaClient) {
  const now = Date.now();

  // Databases seeded before the demo address changed have the workspace owned by
  // a user with another email. Re-point that owner instead of creating a second
  // user, whose new board would collide with the existing slug.
  const existingBoard = await db.board.findUnique({
    where: { slug: DEMO_BOARD.slug },
    select: { owner: { select: { id: true, email: true } } },
  });
  if (existingBoard && existingBoard.owner.email !== DEMO_EMAIL) {
    const emailTaken = await db.user.findUnique({ where: { email: DEMO_EMAIL }, select: { id: true } });
    if (!emailTaken) {
      await db.user.update({ where: { id: existingBoard.owner.id }, data: { email: DEMO_EMAIL } });
    }
  }

  const owner = await db.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { name: DEMO_OWNER_NAME },
    create: { email: DEMO_EMAIL, name: DEMO_OWNER_NAME, emailVerified: new Date() },
  });

  const board = await db.board.upsert({
    where: { ownerId: owner.id },
    update: DEMO_BOARD,
    create: { ...DEMO_BOARD, ownerId: owner.id },
  });

  await db.post.deleteMany({ where: { boardId: board.id } }); // cascades votes + comments

  const categories = new Map<string, string>();
  for (const c of DEMO_CATEGORIES) {
    const row = await db.category.upsert({
      where: { boardId_name: { boardId: board.id, name: c.name } },
      update: { color: c.color },
      create: { ...c, boardId: board.id },
    });
    categories.set(c.name, row.id);
  }

  const voterEmail = (name: string) => `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.test`;
  await db.user.createMany({
    data: DEMO_VOTERS.map((name, i) => ({
      email: voterEmail(name),
      name,
      createdAt: new Date(now - (70 - i) * DAY),
    })),
    skipDuplicates: true,
  });
  const voterRows = await db.user.findMany({
    where: { email: { in: DEMO_VOTERS.map(voterEmail) } },
    select: { id: true, email: true },
  });
  const voterIds = DEMO_VOTERS.map((name) => voterRows.find((v) => v.email === voterEmail(name))!.id);
  const voter = (i: number) => voterIds[i % voterIds.length]!;

  const posts = await db.post.createManyAndReturn({
    data: DEMO_POSTS.map((p, pi) => ({
      title: p.title,
      content: p.content,
      status: p.status,
      boardId: board.id,
      authorId: voter(pi * 7),
      categoryId: categories.get(p.cat),
      createdAt: new Date(now - p.daysAgo * DAY - pi * HOUR),
    })),
    select: { id: true, title: true, createdAt: true },
  });
  const postByTitle = new Map(posts.map((p) => [p.title, p]));

  const votes: { postId: string; userId: string }[] = [];
  const comments: { postId: string; authorId: string; content: string; createdAt: Date }[] = [];

  DEMO_POSTS.forEach((p, pi) => {
    const post = postByTitle.get(p.title)!;
    // Rotate the voter window per post so different people vote on different things
    for (let i = 0; i < Math.min(p.votes, voterIds.length); i++) {
      votes.push({ postId: post.id, userId: voter(pi * 5 + i) });
    }
    if (p.guestVoted) votes.push({ postId: post.id, userId: owner.id });

    p.comments.forEach((raw, ci) => {
      const fromTeam = raw.startsWith("team:");
      comments.push({
        postId: post.id,
        authorId: fromTeam ? owner.id : voter(pi * 3 + ci + 1),
        content: fromTeam ? raw.slice(5) : raw,
        createdAt: new Date(post.createdAt.getTime() + (ci + 1) * Math.max(1, p.daysAgo / 4) * 6 * HOUR),
      });
    });
  });

  await db.vote.createMany({ data: votes, skipDuplicates: true });
  await db.comment.createMany({ data: comments });

  return { slug: board.slug, posts: posts.length, voters: voterIds.length };
}
