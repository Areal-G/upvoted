import { describe, expect, it } from "vitest";
import type { DMMF } from "@prisma/generator-helper";
import { DEMO_EMAIL, DEMO_POSTS } from "@/lib/demo/data";
import { seedDemoWorkspace } from "@/lib/demo/seed";
import { createMemoryDatabase } from "@/lib/memory-db/engine";
import datamodel from "@/lib/memory-db/datamodel.generated.json";

const schema = datamodel as unknown as DMMF.Datamodel;

async function snapshotIds(db: ReturnType<typeof createMemoryDatabase>["client"]) {
  const select = { select: { id: true }, orderBy: { id: "asc" } } as const;
  return {
    users: await db.user.findMany(select),
    boards: await db.board.findMany(select),
    categories: await db.category.findMany(select),
    posts: await db.post.findMany(select),
    votes: await db.vote.findMany(select),
    comments: await db.comment.findMany(select),
  };
}

describe("demo seed", () => {
  it("builds identical IDs on every instance", async () => {
    const a = createMemoryDatabase(schema, { seed: seedDemoWorkspace });
    const b = createMemoryDatabase(schema, { seed: seedDemoWorkspace });
    const ids = await snapshotIds(a.client);
    expect(ids.posts).toHaveLength(DEMO_POSTS.length);
    expect(await snapshotIds(b.client)).toEqual(ids);
  });

  it("restores the same workspace and IDs after a reset", async () => {
    const memoryDb = createMemoryDatabase(schema, { seed: seedDemoWorkspace });
    const before = await snapshotIds(memoryDb.client);
    await memoryDb.client.post.deleteMany();
    await memoryDb.client.user.create({ data: { email: "someone@example.test" } });

    await memoryDb.reset();
    expect(await snapshotIds(memoryDb.client)).toEqual(before);
  });

  it("handles resets that arrive while the workspace is still seeding", async () => {
    const reference = createMemoryDatabase(schema, { seed: seedDemoWorkspace });
    const expected = await snapshotIds(reference.client);

    // A fresh instance is still running its startup seed when the first guest signs in
    const memoryDb = createMemoryDatabase(schema, { seed: seedDemoWorkspace });
    await Promise.all([memoryDb.reset(), memoryDb.reset()]);
    expect(await snapshotIds(memoryDb.client)).toEqual(expected);
  });

  it("creates the guest account that owns the demo board", async () => {
    const { client: db } = createMemoryDatabase(schema, { seed: seedDemoWorkspace });
    const guest = await db.user.findUnique({
      where: { email: DEMO_EMAIL },
      select: { board: { select: { slug: true, _count: { select: { posts: true } } } } },
    });
    expect(guest?.board).toEqual({ slug: "planhive", _count: { posts: DEMO_POSTS.length } });
  });
});
