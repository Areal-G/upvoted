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

// Fills an empty database with the guest demo workspace: the guest account, its
// board, posts, votes and comments. Runs in a fixed order so the counter-based IDs
// of the in-memory database come out the same on every server instance.
export async function seedDemoWorkspace(db: PrismaClient) {
  const now = Date.now();

  const owner = await db.user.create({
    data: { email: DEMO_EMAIL, name: DEMO_OWNER_NAME, emailVerified: new Date(now) },
  });
  const board = await db.board.create({ data: { ...DEMO_BOARD, ownerId: owner.id } });

  const categories = new Map<string, string>();
  for (const c of DEMO_CATEGORIES) {
    const row = await db.category.create({ data: { ...c, boardId: board.id } });
    categories.set(c.name, row.id);
  }

  const voterEmail = (name: string) =>
    `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.test`;
  const voters = await db.user.createManyAndReturn({
    data: DEMO_VOTERS.map((name, i) => ({
      email: voterEmail(name),
      name,
      createdAt: new Date(now - (70 - i) * DAY),
    })),
    select: { id: true },
  });
  const voter = (i: number) => voters[i % voters.length]!.id;

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
    select: { id: true, createdAt: true },
  });

  const votes: { postId: string; userId: string }[] = [];
  const comments: { postId: string; authorId: string; content: string; createdAt: Date }[] = [];

  DEMO_POSTS.forEach((p, pi) => {
    const post = posts[pi]!;
    // Rotate the voter window per post so different people vote on different things
    for (let i = 0; i < Math.min(p.votes, voters.length); i++) {
      votes.push({ postId: post.id, userId: voter(pi * 5 + i) });
    }
    if (p.guestVoted) votes.push({ postId: post.id, userId: owner.id });

    p.comments.forEach((raw, ci) => {
      const fromTeam = raw.startsWith("team:");
      comments.push({
        postId: post.id,
        authorId: fromTeam ? owner.id : voter(pi * 3 + ci + 1),
        content: fromTeam ? raw.slice(5) : raw,
        createdAt: new Date(
          post.createdAt.getTime() + (ci + 1) * Math.max(1, p.daysAgo / 4) * 6 * HOUR,
        ),
      });
    });
  });

  await db.vote.createMany({ data: votes });
  await db.comment.createMany({ data: comments });

  return { slug: board.slug, posts: posts.length, voters: voters.length };
}
