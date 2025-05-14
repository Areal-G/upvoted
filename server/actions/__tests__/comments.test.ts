import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import type { PrismaClient } from "@prisma/client";
import type { Session } from "next-auth";
import { db } from "@/lib/db";
import { createComment, deleteComment } from "@/server/actions/comments";

vi.mock("@/auth", () => ({ auth: vi.fn() }));

const mockedDb = db as unknown as ReturnType<typeof mockDeep<PrismaClient>>;

type AuthFn = () => Promise<Session | null>;

describe("createComment", () => {
  beforeEach(async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth as unknown as AuthFn).mockResolvedValue({
      user: { id: "user-1", email: "u@test.com" },
      expires: new Date(Date.now() + 3600_000).toISOString(),
    });
  });

  it("rejects empty content", async () => {
    const result = await createComment({
      postId: "clpostxxxxxxxxxxxxxxxxxxx",
      content: "   ",
    });
    expect(result.ok).toBe(false);
  });

  it("rejects content over 1000 characters", async () => {
    const result = await createComment({
      postId: "clpostxxxxxxxxxxxxxxxxxxx",
      content: "x".repeat(1001),
    });
    expect(result.ok).toBe(false);
  });

  it("creates a comment with valid input", async () => {
    mockedDb.post.findUnique.mockResolvedValue({
      id: "post-1",
      board: { slug: "demo", isPublic: true },
    } as never);
    mockedDb.comment.create.mockResolvedValue({ id: "comment-1" } as never);

    const result = await createComment({
      postId: "clpostxxxxxxxxxxxxxxxxxxx",
      content: "Looks great",
    });

    expect(result).toEqual({ ok: true, data: { commentId: "comment-1" } });
  });
});

describe("deleteComment", () => {
  beforeEach(async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth as unknown as AuthFn).mockResolvedValue({
      user: { id: "user-1", email: "u@test.com" },
      expires: new Date(Date.now() + 3600_000).toISOString(),
    });
  });

  it("allows the comment author to delete their comment", async () => {
    mockedDb.comment.findUnique.mockResolvedValue({
      authorId: "user-1",
      post: { id: "post-1", board: { slug: "demo", ownerId: "someone-else" } },
    } as never);
    mockedDb.comment.delete.mockResolvedValue({} as never);

    const result = await deleteComment({ commentId: "clcommentxxxxxxxxxxxxxxxx" });
    expect(result.ok).toBe(true);
  });

  it("allows the board owner to delete any comment", async () => {
    mockedDb.comment.findUnique.mockResolvedValue({
      authorId: "someone-else",
      post: { id: "post-1", board: { slug: "demo", ownerId: "user-1" } },
    } as never);
    mockedDb.comment.delete.mockResolvedValue({} as never);

    const result = await deleteComment({ commentId: "clcommentxxxxxxxxxxxxxxxx" });
    expect(result.ok).toBe(true);
  });

  it("forbids unrelated users", async () => {
    mockedDb.comment.findUnique.mockResolvedValue({
      authorId: "someone-else",
      post: { id: "post-1", board: { slug: "demo", ownerId: "another-one" } },
    } as never);

    const result = await deleteComment({ commentId: "clcommentxxxxxxxxxxxxxxxx" });
    expect(result).toMatchObject({ ok: false, error: "Forbidden" });
    expect(mockedDb.comment.delete).not.toHaveBeenCalled();
  });
});
