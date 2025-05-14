import type { PrismaClient } from "@prisma/client";
import { slugify } from "@/lib/slug";

// Every account owns exactly one board, created on sign-up with a free slug
export async function createDefaultBoard(
  db: PrismaClient,
  user: { id: string; name?: string | null; username?: string | null; email: string },
) {
  const base = slugify(user.username ?? user.name ?? user.email.split("@")[0] ?? "board") || "board";
  let slug = base;
  let suffix = 0;
  while (await db.board.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }

  const label = user.name ?? user.username;
  return db.board.create({
    data: { slug, name: label ? `${label}'s board` : "My board", ownerId: user.id },
  });
}
