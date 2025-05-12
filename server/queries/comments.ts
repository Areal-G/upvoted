import { db } from "@/lib/db";

export type PublicComment = Awaited<ReturnType<typeof listPostComments>>[number];

export async function listPostComments(postId: string) {
  return db.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      content: true,
      createdAt: true,
      authorId: true,
      author: { select: { name: true, image: true } },
    },
  });
}
