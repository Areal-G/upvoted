"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { updateBoardSchema, type UpdateBoardInput } from "@/lib/validators/boards";

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; issues?: Record<string, string[]> };

const RESERVED_SLUGS = new Set([
  "api",
  "auth",
  "login",
  "logout",
  "dashboard",
  "settings",
  "posts",
  "admin",
  "signup",
]);

export async function updateBoard(
  input: UpdateBoardInput,
): Promise<ActionResult<{ slug: string }>> {
  const parsed = updateBoardSchema.safeParse(input);
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
    where: { ownerId: session.user.id },
    select: { id: true, slug: true },
  });
  if (!board) return { ok: false, error: "Board not found" };

  if (RESERVED_SLUGS.has(parsed.data.slug)) {
    return { ok: false, error: "This slug is reserved" };
  }

  if (parsed.data.slug !== board.slug) {
    const taken = await db.board.findUnique({
      where: { slug: parsed.data.slug },
      select: { id: true },
    });
    if (taken) return { ok: false, error: "Slug already taken" };
  }

  await db.board.update({
    where: { id: board.id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      slug: parsed.data.slug,
      isPublic: parsed.data.isPublic,
    },
  });

  revalidatePath(`/b/${board.slug}`);
  revalidatePath(`/b/${parsed.data.slug}`);
  revalidatePath("/dashboard");
  revalidatePath("/settings");

  return { ok: true, data: { slug: parsed.data.slug } };
}
