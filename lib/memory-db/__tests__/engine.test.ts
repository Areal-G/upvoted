import { describe, expect, it } from "vitest";
import type { PrismaClient } from "@prisma/client";
import type { DMMF } from "@prisma/generator-helper";
import { createMemoryDatabase } from "@/lib/memory-db/engine";
import datamodel from "@/lib/memory-db/datamodel.generated.json";

const schema = datamodel as unknown as DMMF.Datamodel;

async function setup() {
  const { client: db } = createMemoryDatabase(schema);
  const owner = await db.user.create({ data: { email: "owner@example.test", name: "Owner" } });
  const voter = await db.user.create({ data: { email: "voter@example.test", name: "Voter" } });
  const board = await db.board.create({
    data: { slug: "acme", name: "Acme", ownerId: owner.id },
  });
  const category = await db.category.create({ data: { name: "Bug", boardId: board.id } });
  const [first, second, third] = await db.post.createManyAndReturn({
    data: [
      { title: "First", content: "c", status: "DONE", boardId: board.id, createdAt: new Date(1) },
      {
        title: "Second",
        content: "c",
        status: "OPEN",
        boardId: board.id,
        authorId: voter.id,
        categoryId: category.id,
        createdAt: new Date(2),
      },
      {
        title: "Third",
        content: "c",
        status: "PLANNED",
        boardId: board.id,
        createdAt: new Date(3),
      },
    ],
  });
  await db.vote.createMany({
    data: [
      { postId: second!.id, userId: owner.id },
      { postId: second!.id, userId: voter.id },
      { postId: third!.id, userId: voter.id },
    ],
  });
  await db.comment.create({ data: { content: "Hi", postId: second!.id, authorId: voter.id } });
  return { db: db as PrismaClient, owner, voter, board, category, first, second, third };
}

describe("memory database", () => {
  it("applies schema defaults and deterministic cuid-shaped IDs", async () => {
    const { owner, board, first } = await setup();
    expect(owner.id).toBe("cuser00000000000000000001");
    expect(owner.id).toMatch(/^c[a-z0-9]{24}$/);
    expect(owner.createdAt).toBeInstanceOf(Date);
    expect(owner.passwordHash).toBeNull();
    expect(board.isPublic).toBe(true);
    expect(first!.status).toBe("DONE");
  });

  it("enforces unique constraints, including compound ones", async () => {
    const { db, owner, second } = await setup();
    await expect(db.user.create({ data: { email: owner.email } })).rejects.toMatchObject({
      code: "P2002",
    });
    await expect(
      db.vote.create({ data: { postId: second!.id, userId: owner.id } }),
    ).rejects.toMatchObject({ code: "P2002" });
    const result = await db.vote.createMany({
      data: [{ postId: second!.id, userId: owner.id }],
      skipDuplicates: true,
    });
    expect(result.count).toBe(0);
  });

  it("rejects foreign keys that point nowhere", async () => {
    const { db } = await setup();
    await expect(
      db.board.create({ data: { slug: "x", name: "X", ownerId: "missing" } }),
    ).rejects.toMatchObject({ code: "P2003" });
  });

  it("finds by unique fields, compound keys, OR, in and relation filters", async () => {
    const { db, owner, voter, board, second } = await setup();
    expect((await db.board.findUnique({ where: { slug: "acme" } }))?.id).toBe(board.id);
    const vote = await db.vote.findUnique({
      where: { postId_userId: { postId: second!.id, userId: voter.id } },
    });
    expect(vote?.postId).toBe(second!.id);
    const users = await db.user.findMany({
      where: { OR: [{ email: "nobody@example.test" }, { name: "Owner" }] },
    });
    expect(users.map((u) => u.id)).toEqual([owner.id]);
    expect(await db.post.count({ where: { status: { in: ["OPEN", "DONE"] } } })).toBe(2);
    expect(await db.vote.count({ where: { post: { boardId: board.id } } })).toBe(3);
    expect(await db.post.count({ where: { votes: { some: { userId: owner.id } } } })).toBe(1);
  });

  it("orders by enum declaration order, relation counts, skip and take", async () => {
    const { db, board } = await setup();
    const byStatus = await db.post.findMany({
      where: { boardId: board.id },
      orderBy: { status: "asc" },
      select: { title: true },
    });
    expect(byStatus.map((p) => p.title)).toEqual(["Second", "Third", "First"]);

    const byVotes = await db.post.findMany({
      orderBy: [{ votes: { _count: "desc" } }, { createdAt: "desc" }],
      skip: 1,
      take: 1,
      select: { title: true },
    });
    expect(byVotes.map((p) => p.title)).toEqual(["Third"]);
  });

  it("selects nested relations, filtered lists and _count", async () => {
    const { db, owner, second } = await setup();
    const post = await db.post.findUnique({
      where: { id: second!.id },
      select: {
        title: true,
        board: { select: { slug: true } },
        category: { select: { name: true } },
        _count: { select: { votes: true, comments: true } },
        votes: { where: { userId: owner.id }, select: { id: true } },
      },
    });
    expect(post).toEqual({
      title: "Second",
      board: { slug: "acme" },
      category: { name: "Bug" },
      _count: { votes: 2, comments: 1 },
      votes: [{ id: expect.any(String) }],
    });
    const withAuthor = await db.comment.findFirst({ include: { author: true } });
    expect(withAuthor?.author.name).toBe("Voter");
  });

  it("updates, upserts and keeps updatedAt current", async () => {
    const { db, first, board } = await setup();
    const updated = await db.post.update({
      where: { id: first!.id },
      data: { title: "Renamed", categoryId: undefined },
    });
    expect(updated.title).toBe("Renamed");
    expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(first!.updatedAt.getTime());

    const category = await db.category.upsert({
      where: { boardId_name: { boardId: board.id, name: "Bug" } },
      update: { color: "#000000" },
      create: { name: "Bug", boardId: board.id },
    });
    expect(category.color).toBe("#000000");
    await expect(db.post.update({ where: { id: "missing" }, data: {} })).rejects.toMatchObject({
      code: "P2025",
    });
  });

  it("applies onDelete rules: Cascade and SetNull", async () => {
    const { db, voter, second } = await setup();
    await db.user.delete({ where: { id: voter.id } });
    // Votes and comments cascade; the post survives without an author
    expect(await db.vote.count({ where: { userId: voter.id } })).toBe(0);
    expect(await db.comment.count()).toBe(0);
    expect((await db.post.findUnique({ where: { id: second!.id } }))?.authorId).toBeNull();

    const { count } = await db.post.deleteMany({ where: { boardId: second!.boardId } });
    expect(count).toBe(3);
    expect(await db.vote.count()).toBe(0);
  });

  it("groups by a field with counts", async () => {
    const { db, board } = await setup();
    const groups = await db.post.groupBy({
      by: ["status"],
      where: { boardId: board.id },
      _count: { _all: true },
    });
    expect(groups).toEqual(
      expect.arrayContaining([
        { status: "DONE", _count: { _all: 1 } },
        { status: "OPEN", _count: { _all: 1 } },
        { status: "PLANNED", _count: { _all: 1 } },
      ]),
    );
  });

  it("rolls back an interactive transaction that throws", async () => {
    const { db } = await setup();
    await expect(
      db.$transaction(async (tx) => {
        await tx.user.create({ data: { email: "temp@example.test" } });
        throw new Error("abort");
      }),
    ).rejects.toThrow("abort");
    expect(await db.user.count()).toBe(2);
  });

  it("throws on arguments it does not support instead of ignoring them", async () => {
    const { db } = await setup();
    await expect(db.post.findMany({ distinct: ["status"] })).rejects.toThrow(/does not support/);
  });
});
