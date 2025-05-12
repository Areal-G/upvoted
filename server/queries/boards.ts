import { db } from "@/lib/db";

export async function getBoardBySlug(slug: string) {
  return db.board.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      isPublic: true,
      ownerId: true,
      categories: { select: { id: true, name: true, color: true } },
    },
  });
}

export async function getBoardByOwner(ownerId: string) {
  return db.board.findUnique({ where: { ownerId } });
}
