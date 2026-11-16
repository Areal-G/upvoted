/**
 * Fills the database with a sample workspace: Planhive's feedback board at /b/planhive,
 * owned by an account you can sign in with (see ./config.ts).
 *
 * Run:  npm run seed
 * Safe to re-run: it resets the sample workspace to its initial state.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import { SEED_OWNER } from "./config";
import { seedSampleWorkspace } from "./sample-workspace";

const adapter = new PrismaPg({ connectionString: process.env["DATABASE_URL"] });
const db = new PrismaClient({ adapter });

seedSampleWorkspace(db, SEED_OWNER)
  .then((r) =>
    console.warn(
      `Seeded /b/${r.slug}: ${r.posts} posts, ${r.voters} voters. Sign in as ${SEED_OWNER.email}`,
    ),
  )
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
