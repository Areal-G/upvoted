import type { PrismaClient } from "@prisma/client";
import { hashPassword } from "../../lib/password";
import {
  SAMPLE_BOARD,
  SAMPLE_CATEGORIES,
  SAMPLE_OWNER_NAME,
  SAMPLE_POSTS,
  SAMPLE_VOTERS,
} from "./data";

const DAY = 86_400_000;
const HOUR = 3_600_000;

// Restores the sample workspace: the owner's sign-in, board settings, posts, votes
// and comments. Anything changed on the sample board since the last run is discarded.
export async function seedSampleWorkspace(
  db: PrismaClient,
  ownerLogin: { email: string; password: string },
) {
  const now = Date.now();

  const passwordHash = await hashPassword(ownerLogin.password);
  const owner = await db.user.upsert({
    where: { email: ownerLogin.email },
    update: { name: SAMPLE_OWNER_NAME, passwordHash },
    create: {
      email: ownerLogin.email,
      name: SAMPLE_OWNER_NAME,
      passwordHash,
      emailVerified: new Date(),
    },
  });

  const board = await db.board.upsert({
    where: { ownerId: owner.id },
    update: SAMPLE_BOARD,
    create: { ...SAMPLE_BOARD, ownerId: owner.id },
  });

  await db.post.deleteMany({ where: { boardId: board.id } }); // cascades votes + comments

  const categories = new Map<string, string>();
  for (const c of SAMPLE_CATEGORIES) {
    const row = await db.category.upsert({
      where: { boardId_name: { boardId: board.id, name: c.name } },
      update: { color: c.color },
      create: { ...c, boardId: board.id },
    });
    categories.set(c.name, row.id);
  }

  const voterEmail = (name: string) =>
    `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.test`;
  await db.user.createMany({
    data: SAMPLE_VOTERS.map((name, i) => ({
      email: voterEmail(name),
      name,
      createdAt: new Date(now - (70 - i) * DAY),
    })),
    skipDuplicates: true,
  });
  const voterRows = await db.user.findMany({
    where: { email: { in: SAMPLE_VOTERS.map(voterEmail) } },
    select: { id: true, email: true },
  });
  const voterIds = SAMPLE_VOTERS.map(
    (name) => voterRows.find((v) => v.email === voterEmail(name))!.id,
  );
  const voter = (i: number) => voterIds[i % voterIds.length]!;

  const posts = await db.post.createManyAndReturn({
    data: SAMPLE_POSTS.map((p, pi) => ({
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

  SAMPLE_POSTS.forEach((p, pi) => {
    const post = postByTitle.get(p.title)!;
    // Rotate the voter window per post so different people vote on different things
    for (let i = 0; i < Math.min(p.votes, voterIds.length); i++) {
      votes.push({ postId: post.id, userId: voter(pi * 5 + i) });
    }
    if (p.ownerVoted) votes.push({ postId: post.id, userId: owner.id });

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

  await db.vote.createMany({ data: votes, skipDuplicates: true });
  await db.comment.createMany({ data: comments });

  return { slug: board.slug, posts: posts.length, voters: voterIds.length };
}
