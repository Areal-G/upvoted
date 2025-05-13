import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import type { PrismaClient } from "@prisma/client";
import type { Session } from "next-auth";
import { db } from "@/lib/db";
import { changeStatus } from "@/server/actions/posts";

vi.mock("@/auth", () => ({ auth: vi.fn() }));

const mockedDb = db as unknown as ReturnType<typeof mockDeep<PrismaClient>>;

type AuthFn = () => Promise<Session | null>;

describe("changeStatus", () => {
  beforeEach(async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth as unknown as AuthFn).mockResolvedValue({
      user: { id: "owner-1", email: "owner@test.com" },
      expires: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    });
  });

  it("forbids users who do not own the board", async () => {
    mockedDb.post.findUnique.mockResolvedValue({
      board: { slug: "demo", ownerId: "someone-else" },
    } as never);

    const result = await changeStatus({
      postId: "clxxxxxxxxxxxxxxxxxxxxxxx",
      status: "DONE",
    });

    expect(result).toEqual({ ok: false, error: "Forbidden" });
    expect(mockedDb.post.update).not.toHaveBeenCalled();
  });

  it("updates status when the user owns the board", async () => {
    mockedDb.post.findUnique.mockResolvedValue({
      board: { slug: "demo", ownerId: "owner-1" },
    } as never);
    mockedDb.post.update.mockResolvedValue({} as never);

    const result = await changeStatus({
      postId: "clxxxxxxxxxxxxxxxxxxxxxxx",
      status: "DONE",
    });

    expect(result.ok).toBe(true);
    expect(mockedDb.post.update).toHaveBeenCalledOnce();
  });
});
