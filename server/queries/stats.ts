import { db } from "@/lib/db";
import type { PostStatus } from "@prisma/client";

export type BoardStats = Awaited<ReturnType<typeof getBoardStats>>;
export type TopPost = BoardStats["topPosts"][number];

export async function getBoardStats(boardId: string) {
  const [total, byStatus, totalVotes, totalComments, topPosts] = await Promise.all([
    db.post.count({ where: { boardId } }),
    db.post.groupBy({
      by: ["status"],
      where: { boardId },
      _count: { _all: true },
    }),
    db.vote.count({ where: { post: { boardId } } }),
    db.comment.count({ where: { post: { boardId } } }),
    db.post.findMany({
      where: { boardId },
      orderBy: { votes: { _count: "desc" } },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        _count: { select: { votes: true } },
      },
    }),
  ]);

  const statusMap = byStatus.reduce<Record<PostStatus, number>>(
    (acc: Record<PostStatus, number>, row: (typeof byStatus)[number]) => {
      acc[row.status as PostStatus] = row._count._all;
      return acc;
    },
    { OPEN: 0, PLANNED: 0, IN_PROGRESS: 0, DONE: 0, REJECTED: 0 },
  );

  return {
    total,
    byStatus: statusMap,
    totalVotes,
    totalComments,
    topPosts,
  };
}
