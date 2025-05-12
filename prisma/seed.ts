import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, PostStatus } from "@prisma/client";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env["DATABASE_URL"] });
const db = new PrismaClient({ adapter });

async function main() {
  const user = await db.user.upsert({
    where: { email: "demo@upvoted.app" },
    update: {},
    create: {
      email: "demo@upvoted.app",
      name: "Demo User",
    },
  });

  const board = await db.board.upsert({
    where: { ownerId: user.id },
    update: {},
    create: {
      slug: "demo",
      name: "Demo board",
      description: "Sample feedback board for Upvoted.",
      ownerId: user.id,
    },
  });

  const categories = await Promise.all(
    [
      { name: "Feature", color: "#6366f1" },
      { name: "Bug", color: "#ef4444" },
      { name: "Improvement", color: "#10b981" },
    ].map((c) =>
      db.category.upsert({
        where: { boardId_name: { boardId: board.id, name: c.name } },
        update: {},
        create: { ...c, boardId: board.id },
      }),
    ),
  );

  const samplePosts = [
    { title: "Dark mode for the dashboard", status: PostStatus.PLANNED, cat: 0 },
    { title: "Export feedback as CSV", status: PostStatus.OPEN, cat: 0 },
    { title: "Voting button misaligned on mobile", status: PostStatus.IN_PROGRESS, cat: 1 },
    { title: "Slack integration for new posts", status: PostStatus.OPEN, cat: 0 },
    { title: "Faster page load on large boards", status: PostStatus.DONE, cat: 2 },
    { title: "Spam from disposable emails", status: PostStatus.REJECTED, cat: 1 },
  ];

  for (const p of samplePosts) {
    await db.post.create({
      data: {
        title: p.title,
        content: `${p.title}. More details about why this matters and what it should do.`,
        status: p.status,
        boardId: board.id,
        authorId: user.id,
        categoryId: categories[p.cat]?.id,
      },
    });
  }

  console.warn(`Seeded board /b/${board.slug} with ${samplePosts.length} posts`);

  const createdPosts = await db.post.findMany({
    where: { boardId: board.id },
    select: { id: true },
  });

  const voters = await Promise.all(
    Array.from({ length: 8 }).map((_, i) =>
      db.user.upsert({
        where: { email: `voter${i}@upvoted.app` },
        update: {},
        create: { email: `voter${i}@upvoted.app`, name: `Voter ${i + 1}` },
      }),
    ),
  );

  for (const post of createdPosts) {
    const voteCount = Math.floor(Math.random() * voters.length);
    for (let i = 0; i < voteCount; i++) {
      const voter = voters[i];
      if (!voter) continue;
      await db.vote.upsert({
        where: { postId_userId: { postId: post.id, userId: voter.id } },
        update: {},
        create: { postId: post.id, userId: voter.id },
      });
    }

    const commentCount = Math.floor(Math.random() * 3);
    for (let i = 0; i < commentCount; i++) {
      const voter = voters[i];
      if (!voter) continue;
      await db.comment.create({
        data: {
          postId: post.id,
          authorId: voter.id,
          content: `Great idea. This would really improve my workflow.`,
        },
      });
    }
  }

  console.warn(`Seeded ${voters.length} voters with random votes and comments`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
