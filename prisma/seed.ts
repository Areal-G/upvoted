/**
 * Seeds the guest demo workspace (Planhive's feedback board at /b/planhive).
 * Real accounts never need this — users sign up at /signup and start empty.
 *
 * Run:  npm run db:seed
 * Safe to re-run: it resets the demo workspace to its sample state.
 * Visitors reach it with "Try demo" (requires DEMO_MODE="true").
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import { resetDemoWorkspace } from "../lib/demo/reset";

const adapter = new PrismaPg({ connectionString: process.env["DATABASE_URL"] });
const db = new PrismaClient({ adapter });

resetDemoWorkspace(db)
  .then((r) => console.warn(`Seeded demo workspace /b/${r.slug}: ${r.posts} posts, ${r.voters} voters`))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
