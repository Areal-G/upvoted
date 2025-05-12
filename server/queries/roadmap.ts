import { db } from "@/lib/db";
import type { PostStatus } from "@prisma/client";

const ROADMAP_STATUSES: PostStatus[] = ["PLANNED", "IN_PROGRESS", "DONE"];

export type RoadmapPost = Awaited<ReturnType<typeof getBoardRoadmap>>["PLANNED"][number];

export async function getBoardRoadmap(boardId: string) {
  const posts = await db.post.findMany({
    where: { boardId, status: { in: ROADMAP_STATUSES } },
    orderBy: [{ status: "asc" }, { votes: { _count: "desc" } }],
    select: {
      id: true,
      title: true,
      content: true,
      status: true,
      _count: { select: { votes: true, comments: true } },
    },
  });

  type RoadmapPostItem = (typeof posts)[number];
  return {
    PLANNED: posts.filter((p: RoadmapPostItem) => p.status === "PLANNED"),
    IN_PROGRESS: posts.filter((p: RoadmapPostItem) => p.status === "IN_PROGRESS"),
    DONE: posts.filter((p: RoadmapPostItem) => p.status === "DONE"),
  };
}
