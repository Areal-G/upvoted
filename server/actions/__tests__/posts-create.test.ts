import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import type { PrismaClient } from "@prisma/client";
import type { Session } from "next-auth";
import { db } from "@/lib/db";
import { createPost } from "@/server/actions/posts";

vi.mock("@/auth", () => ({ auth: vi.fn() }));

const mockedDb = db as unknown as ReturnType<typeof mockDeep<PrismaClient>>;

type AuthFn = () => Promise<Session | null>;

describe("createPost", () => {
  beforeEach(async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth as unknown as AuthFn).mockResolvedValue({
      user: { id: "user-1", email: "u@test.com" },
      expires: new Date(Date.now() + 3600_000).toISOString(),
    });
  });

  it("rejects title shorter than 3 characters", async () => {
    const result = await createPost({
      boardSlug: "demo",
      title: "hi",
      content: "Some valid content here",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues?.["title"]).toBeDefined();
    }
  });

  it("rejects content shorter than 10 characters", async () => {
    const result = await createPost({
      boardSlug: "demo",
      title: "Valid title",
      content: "short",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues?.["content"]).toBeDefined();
    }
  });

  it("rejects unauthenticated users", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth as unknown as AuthFn).mockResolvedValueOnce(null);

    const result = await createPost({
      boardSlug: "demo",
      title: "Valid title",
      content: "Valid content with enough characters",
    });
    expect(result).toMatchObject({ ok: false, error: "Unauthorized" });
  });

  it("rejects when board does not exist", async () => {
    mockedDb.board.findUnique.mockResolvedValue(null);

    const result = await createPost({
      boardSlug: "missing",
      title: "Valid title",
      content: "Valid content with enough characters",
    });
    expect(result).toMatchObject({ ok: false, error: "Board not found" });
  });

  it("rejects when board is private", async () => {
    mockedDb.board.findUnique.mockResolvedValue({
      id: "board-1",
      isPublic: false,
    } as never);

    const result = await createPost({
      boardSlug: "demo",
      title: "Valid title",
      content: "Valid content with enough characters",
    });
    expect(result).toMatchObject({ ok: false, error: "Board not found" });
  });

  it("rejects invalid category for the board", async () => {
    mockedDb.board.findUnique.mockResolvedValue({
      id: "board-1",
      isPublic: true,
    } as never);
    mockedDb.category.findFirst.mockResolvedValue(null);

    const result = await createPost({
      boardSlug: "demo",
      title: "Valid title",
      content: "Valid content with enough characters",
      categoryId: "clcategoryxxxxxxxxxxxxxxx",
    });
    expect(result).toMatchObject({ ok: false, error: "Invalid category" });
  });

  it("creates a post with valid input", async () => {
    mockedDb.board.findUnique.mockResolvedValue({
      id: "board-1",
      isPublic: true,
    } as never);
    mockedDb.post.create.mockResolvedValue({ id: "new-post-1" } as never);

    const result = await createPost({
      boardSlug: "demo",
      title: "Valid title",
      content: "Valid content with enough characters",
    });
    expect(result).toEqual({ ok: true, data: { postId: "new-post-1" } });
    expect(mockedDb.post.create).toHaveBeenCalledOnce();
  });
});
