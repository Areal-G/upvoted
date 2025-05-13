import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import type { PrismaClient } from "@prisma/client";
import type { Session } from "next-auth";
import { db } from "@/lib/db";
import { toggleVote } from "@/server/actions/votes";

vi.mock("@/auth", () => ({ auth: vi.fn() }));

const mockedDb = db as unknown as ReturnType<typeof mockDeep<PrismaClient>>;

type AuthFn = () => Promise<Session | null>;

describe("toggleVote", () => {
  beforeEach(async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth as unknown as AuthFn).mockResolvedValue({
      user: { id: "user-1", email: "u@test.com" },
      expires: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    });
  });

  it("rejects invalid postId", async () => {
    const result = await toggleVote({ postId: "not-a-cuid" });
    expect(result.ok).toBe(false);
  });

  it("rejects unauthenticated users", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth as unknown as AuthFn).mockResolvedValueOnce(null);

    const result = await toggleVote({ postId: "clxxxxxxxxxxxxxxxxxxxxxxx" });
    expect(result).toEqual({ ok: false, error: "Unauthorized" });
  });

  it("creates a vote when none exists", async () => {
    mockedDb.post.findUnique.mockResolvedValue({
      id: "post-1",
      board: { slug: "demo", isPublic: true },
    } as never);
    mockedDb.vote.findUnique.mockResolvedValue(null);
    mockedDb.vote.create.mockResolvedValue({} as never);
    mockedDb.vote.count.mockResolvedValue(1);

    const result = await toggleVote({ postId: "clxxxxxxxxxxxxxxxxxxxxxxx" });
    expect(result).toEqual({ ok: true, data: { hasVoted: true, voteCount: 1 } });
    expect(mockedDb.vote.create).toHaveBeenCalledOnce();
    expect(mockedDb.vote.delete).not.toHaveBeenCalled();
  });

  it("removes a vote when one exists", async () => {
    mockedDb.post.findUnique.mockResolvedValue({
      id: "post-1",
      board: { slug: "demo", isPublic: true },
    } as never);
    mockedDb.vote.findUnique.mockResolvedValue({ id: "vote-1" } as never);
    mockedDb.vote.delete.mockResolvedValue({} as never);
    mockedDb.vote.count.mockResolvedValue(0);

    const result = await toggleVote({ postId: "clxxxxxxxxxxxxxxxxxxxxxxx" });
    expect(result).toEqual({ ok: true, data: { hasVoted: false, voteCount: 0 } });
    expect(mockedDb.vote.delete).toHaveBeenCalledOnce();
    expect(mockedDb.vote.create).not.toHaveBeenCalled();
  });
});
