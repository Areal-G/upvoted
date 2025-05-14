import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import type { PrismaClient } from "@prisma/client";
import type { Session } from "next-auth";
import { db } from "@/lib/db";
import { updateBoard } from "@/server/actions/boards";

vi.mock("@/auth", () => ({ auth: vi.fn() }));

const mockedDb = db as unknown as ReturnType<typeof mockDeep<PrismaClient>>;

type AuthFn = () => Promise<Session | null>;

describe("updateBoard", () => {
  beforeEach(async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth as unknown as AuthFn).mockResolvedValue({
      user: { id: "owner-1", email: "o@test.com" },
      expires: new Date(Date.now() + 3600_000).toISOString(),
    });
  });

  const baseInput = {
    name: "My Board",
    description: "A description",
    slug: "my-board",
    isPublic: true,
  };

  it("rejects reserved slugs", async () => {
    mockedDb.board.findUnique.mockResolvedValue({
      id: "board-1",
      slug: "old-slug",
    } as never);

    const result = await updateBoard({ ...baseInput, slug: "api" });
    expect(result).toMatchObject({ ok: false, error: "This slug is reserved" });
  });

  it("rejects slugs with uppercase or invalid characters", async () => {
    const result = await updateBoard({ ...baseInput, slug: "My_Board" });
    expect(result.ok).toBe(false);
  });

  it("rejects slug taken by another board", async () => {
    mockedDb.board.findUnique
      .mockResolvedValueOnce({ id: "board-1", slug: "old-slug" } as never)
      .mockResolvedValueOnce({ id: "other-board" } as never);

    const result = await updateBoard({ ...baseInput, slug: "taken-slug" });
    expect(result).toMatchObject({ ok: false, error: "Slug already taken" });
  });

  it("accepts keeping the same slug", async () => {
    mockedDb.board.findUnique.mockResolvedValue({
      id: "board-1",
      slug: "my-board",
    } as never);
    mockedDb.board.update.mockResolvedValue({} as never);

    const result = await updateBoard(baseInput);
    expect(result).toMatchObject({ ok: true });
  });

  it("rejects unauthenticated users", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth as unknown as AuthFn).mockResolvedValueOnce(null);

    const result = await updateBoard(baseInput);
    expect(result).toMatchObject({ ok: false, error: "Unauthorized" });
  });
});
