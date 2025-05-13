import { vi, beforeEach } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";
import type { PrismaClient } from "@prisma/client";

vi.mock("@/lib/db", () => ({ db: mockDeep<PrismaClient>() }));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

beforeEach(async () => {
  const { db } = await import("@/lib/db");
  mockReset(db as unknown as ReturnType<typeof mockDeep<PrismaClient>>);
});
