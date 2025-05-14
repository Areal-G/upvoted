import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env["DATABASE_URL"] }) });

export async function cleanDatabase() {
  // Order matters due to FK constraints
  await db.comment.deleteMany();
  await db.vote.deleteMany();
  await db.post.deleteMany();
  await db.category.deleteMany();
  await db.board.deleteMany();
  await db.session.deleteMany();
  await db.account.deleteMany();
  await db.verificationToken.deleteMany();
  await db.user.deleteMany();
}

export async function seedDemoBoard() {
  const user = await db.user.create({
    data: {
      email: "demo@upvoted.app",
      name: "Demo",
      emailVerified: new Date(),
    },
  });

  const board = await db.board.create({
    data: {
      slug: "demo",
      name: "Demo board",
      description: "Test fixture board",
      ownerId: user.id,
    },
  });

  const post = await db.post.create({
    data: {
      title: "Existing feature request",
      content: "This is a pre-seeded post used by e2e tests.",
      boardId: board.id,
      authorId: user.id,
    },
  });

  // Seed test users used across e2e specs so authorize() finds them instead of
  // creating them on-the-fly (production Next.js doesn't always commit in time
  // for the next request).
  for (const { email, name, slug } of [
    { email: "alice@test.com", name: "alice", slug: "alice" },
    { email: "bob@test.com", name: "bob", slug: "bob" },
    { email: "carol@test.com", name: "carol", slug: "carol" },
  ]) {
    const u = await db.user.create({
      data: { email, name, emailVerified: new Date() },
    });
    await db.board.create({
      data: { slug, name: `${name}'s board`, ownerId: u.id },
    });
  }

  return { user, board, post };
}

export async function disconnect() {
  await db.$disconnect();
}
