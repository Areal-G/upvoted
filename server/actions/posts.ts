"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  changeStatusSchema,
  createPostSchema,
  deletePostSchema,
  updatePostSchema,
  type CreatePostInput,
} from "@/lib/validators/posts";
import { z } from "zod";

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; issues?: Record<string, string[]> };

export async function createPost(
  input: CreatePostInput,
): Promise<ActionResult<{ postId: string }>> {
  const parsed = createPostSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Invalid input",
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Unauthorized" };

  const board = await db.board.findUnique({
    where: { slug: parsed.data.boardSlug },
    select: { id: true, isPublic: true },
  });
  if (!board || !board.isPublic) return { ok: false, error: "Board not found" };

  if (parsed.data.categoryId) {
    const cat = await db.category.findFirst({
      where: { id: parsed.data.categoryId, boardId: board.id },
      select: { id: true },
    });
    if (!cat) return { ok: false, error: "Invalid category" };
  }

  const post = await db.post.create({
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      categoryId: parsed.data.categoryId ?? undefined,
      boardId: board.id,
      authorId: session.user.id,
    },
    select: { id: true },
  });

  revalidatePath(`/b/${parsed.data.boardSlug}`);
  return { ok: true, data: { postId: post.id } };
}

export async function changeStatus(
  input: z.infer<typeof changeStatusSchema>,
): Promise<ActionResult> {
  const parsed = changeStatusSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Unauthorized" };

  const post = await db.post.findUnique({
    where: { id: parsed.data.postId },
    select: { board: { select: { slug: true, ownerId: true } } },
  });
  if (!post) return { ok: false, error: "Post not found" };
  if (post.board.ownerId !== session.user.id) {
    return { ok: false, error: "Forbidden" };
  }

  await db.post.update({
    where: { id: parsed.data.postId },
    data: { status: parsed.data.status },
  });

  revalidatePath(`/b/${post.board.slug}`);
  revalidatePath(`/b/${post.board.slug}/roadmap`);
  revalidatePath(`/posts`);
  return { ok: true, data: undefined };
}

export async function updatePost(input: z.infer<typeof updatePostSchema>): Promise<ActionResult> {
  const parsed = updatePostSchema.safeParse(input);
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
    select: {
      authorId: true,
      board: { select: { slug: true, ownerId: true, id: true } },
    },
  });
  if (!post) return { ok: false, error: "Post not found" };

  const isOwner = post.board.ownerId === session.user.id;
  const isAuthor = post.authorId === session.user.id;
  if (!isOwner && !isAuthor) return { ok: false, error: "Forbidden" };

  if (parsed.data.categoryId) {
    const cat = await db.category.findFirst({
      where: { id: parsed.data.categoryId, boardId: post.board.id },
      select: { id: true },
    });
    if (!cat) return { ok: false, error: "Invalid category" };
  }

  await db.post.update({
    where: { id: parsed.data.postId },
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      categoryId: parsed.data.categoryId,
    },
  });

  revalidatePath(`/b/${post.board.slug}`);
  revalidatePath(`/posts`);
  return { ok: true, data: undefined };
}

export async function deletePost(input: z.infer<typeof deletePostSchema>): Promise<ActionResult> {
  const parsed = deletePostSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Unauthorized" };

  const post = await db.post.findUnique({
    where: { id: parsed.data.postId },
    select: {
      authorId: true,
      board: { select: { slug: true, ownerId: true } },
    },
  });
  if (!post) return { ok: false, error: "Post not found" };

  const isOwner = post.board.ownerId === session.user.id;
  const isAuthor = post.authorId === session.user.id;
  if (!isOwner && !isAuthor) return { ok: false, error: "Forbidden" };

  await db.post.delete({ where: { id: parsed.data.postId } });

  revalidatePath(`/b/${post.board.slug}`);
  revalidatePath(`/posts`);
  return { ok: true, data: undefined };
}
