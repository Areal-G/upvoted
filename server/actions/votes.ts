"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { toggleVoteSchema, type ToggleVoteInput } from "@/lib/validators/votes";

type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: string };

export async function toggleVote(
  input: ToggleVoteInput,
): Promise<ActionResult<{ hasVoted: boolean; voteCount: number }>> {
  const parsed = toggleVoteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Unauthorized" };

  const post = await db.post.findUnique({
    where: { id: parsed.data.postId },
    select: { id: true, board: { select: { slug: true, isPublic: true } } },
  });
  if (!post || !post.board.isPublic) return { ok: false, error: "Post not found" };

  const existing = await db.vote.findUnique({
    where: { postId_userId: { postId: post.id, userId: session.user.id } },
    select: { id: true },
  });

  if (existing) {
    await db.vote.delete({ where: { id: existing.id } });
  } else {
    await db.vote.create({
      data: { postId: post.id, userId: session.user.id },
    });
  }

  const voteCount = await db.vote.count({ where: { postId: post.id } });

  revalidatePath(`/b/${post.board.slug}`);
  revalidatePath(`/b/${post.board.slug}/posts/${post.id}`);

  return { ok: true, data: { hasVoted: !existing, voteCount } };
}
