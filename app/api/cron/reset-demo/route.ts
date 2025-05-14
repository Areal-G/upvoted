import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PostStatus } from "@prisma/client";

const SEED_POSTS: { title: string; status: PostStatus; cat: number }[] = [
  { title: "Dark mode for the dashboard", status: PostStatus.PLANNED, cat: 0 },
  { title: "Export feedback as CSV", status: PostStatus.OPEN, cat: 0 },
  { title: "Voting button misaligned on mobile", status: PostStatus.IN_PROGRESS, cat: 1 },
  { title: "Slack integration for new posts", status: PostStatus.OPEN, cat: 0 },
  { title: "Faster page load on large boards", status: PostStatus.DONE, cat: 2 },
  { title: "Spam from disposable emails", status: PostStatus.REJECTED, cat: 1 },
];

const SEED_CATEGORIES = [
  { name: "Feature", color: "#6366f1" },
  { name: "Bug", color: "#ef4444" },
  { name: "Improvement", color: "#10b981" },
];

export async function GET(req: Request) {
  const cronSecret = process.env["CRON_SECRET"];
  const authHeader = req.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (process.env["DEMO_MODE"] !== "true") {
    return NextResponse.json({ error: "Not in demo mode" }, { status: 400 });
  }

  const demoUser = await db.user.findUnique({ where: { email: "demo@upvoted.app" } });
  if (!demoUser) {
    return NextResponse.json({ error: "Demo user not found" }, { status: 404 });
  }

  const board = await db.board.findUnique({ where: { ownerId: demoUser.id } });
  if (!board) {
    return NextResponse.json({ error: "Demo board not found" }, { status: 404 });
  }

  // Delete all posts — cascades votes and comments
  await db.post.deleteMany({ where: { boardId: board.id } });

  const categories = await Promise.all(
    SEED_CATEGORIES.map((c) =>
      db.category.upsert({
        where: { boardId_name: { boardId: board.id, name: c.name } },
        update: {},
        create: { ...c, boardId: board.id },
      }),
    ),
  );

  const voters = await Promise.all(
    Array.from({ length: 8 }).map((_, i) =>
      db.user.upsert({
        where: { email: `voter${i}@upvoted.app` },
        update: {},
        create: { email: `voter${i}@upvoted.app`, name: `Voter ${i + 1}` },
      }),
    ),
  );

  for (const p of SEED_POSTS) {
    const post = await db.post.create({
      data: {
        title: p.title,
        content: `${p.title}. More details about why this matters and what it should do.`,
        status: p.status,
        boardId: board.id,
        authorId: demoUser.id,
        categoryId: categories[p.cat]?.id,
      },
    });

    const voteCount = Math.floor(Math.random() * voters.length);
    for (let i = 0; i < voteCount; i++) {
      const voter = voters[i];
      if (!voter) continue;
      await db.vote.create({ data: { postId: post.id, userId: voter.id } });
    }

    const commentCount = Math.floor(Math.random() * 3);
    for (let i = 0; i < commentCount; i++) {
      const voter = voters[i];
      if (!voter) continue;
      await db.comment.create({
        data: {
          postId: post.id,
          authorId: voter.id,
          content: "Great idea. This would really improve my workflow.",
        },
      });
    }
  }

  return NextResponse.json({ ok: true, reset: new Date().toISOString() });
}
