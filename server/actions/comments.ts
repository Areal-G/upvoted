"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  createCommentSchema,
  deleteCommentSchema,
  type CreateCommentInput,
} from "@/lib/validators/comments";
import type { z } from "zod";

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; issues?: Record<string, string[]> };

export async function createComment(
  input: CreateCommentInput,
): Promise<ActionResult<{ commentId: string }>> {
  const parsed = createCommentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Invalid input",
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Unauthorized" };

  const post = await db.post.findUnique({
    where: { id: parsed.data.postId },
    select: { id: true, board: { select: { slug: true, isPublic: true } } },
  });
  if (!post || !post.board.isPublic) return { ok: false, error: "Post not found" };

  const comment = await db.comment.create({
    data: {
      content: parsed.data.content,
      postId: post.id,
      authorId: session.user.id,
    },
    select: { id: true },
  });

  revalidatePath(`/b/${post.board.slug}/posts/${post.id}`);
  return { ok: true, data: { commentId: comment.id } };
}

export async function deleteComment(
  input: z.infer<typeof deleteCommentSchema>,
): Promise<ActionResult> {
  const parsed = deleteCommentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Unauthorized" };

  const comment = await db.comment.findUnique({
    where: { id: parsed.data.commentId },
    select: {
      authorId: true,
      post: { select: { id: true, board: { select: { slug: true, ownerId: true } } } },
    },
  });
  if (!comment) return { ok: false, error: "Comment not found" };

  const isAuthor = comment.authorId === session.user.id;
  const isBoardOwner = comment.post.board.ownerId === session.user.id;
  if (!isAuthor && !isBoardOwner) return { ok: false, error: "Forbidden" };

  await db.comment.delete({ where: { id: parsed.data.commentId } });

  revalidatePath(`/b/${comment.post.board.slug}/posts/${comment.post.id}`);
  return { ok: true, data: undefined };
}
