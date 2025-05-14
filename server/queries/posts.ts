import { db } from "@/lib/db";
import { auth } from "@/auth";
import { POSTS_PER_PAGE } from "@/lib/constants";
import type { ListPostsQuery } from "@/lib/validators/posts";

export type PublicPost = Awaited<ReturnType<typeof listBoardPosts>>["posts"][number];

export async function listBoardPosts(query: ListPostsQuery) {
  const session = await auth();
  const userId = session?.user?.id;

  const board = await db.board.findUnique({
    where: { slug: query.slug },
    select: { id: true, isPublic: true },
  });

  if (!board || !board.isPublic) {
    return { posts: [], total: 0, board: null };
  }

  const where = {
    boardId: board.id,
    ...(query.status ? { status: query.status } : {}),
  };

  const [posts, total] = await Promise.all([
    db.post.findMany({
      where,
      orderBy:
        query.sort === "top"
          ? [{ votes: { _count: "desc" } }, { createdAt: "desc" }]
          : { createdAt: "desc" },
      skip: (query.page - 1) * POSTS_PER_PAGE,
      take: POSTS_PER_PAGE,
      select: {
        id: true,
        title: true,
        content: true,
        status: true,
        createdAt: true,
        category: { select: { id: true, name: true, color: true } },
        _count: { select: { votes: true, comments: true } },
        votes: userId ? { where: { userId }, select: { id: true } } : false,
      },
    }),
    db.post.count({ where }),
  ]);

  return {
    board,
    total,
    posts: posts.map((p: (typeof posts)[number]) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      status: p.status,
      createdAt: p.createdAt,
      category: p.category,
      voteCount: p._count.votes,
      commentCount: p._count.comments,
      hasVoted: userId ? Array.isArray(p.votes) && p.votes.length > 0 : false,
    })),
  };
}

export async function getPostById(postId: string) {
  const session = await auth();
  const userId = session?.user?.id;

  const post = await db.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      title: true,
      content: true,
      status: true,
      createdAt: true,
      board: { select: { id: true, slug: true, name: true, ownerId: true, isPublic: true } },
      category: { select: { id: true, name: true, color: true } },
      _count: { select: { votes: true, comments: true } },
      votes: userId ? { where: { userId }, select: { id: true } } : false,
    },
  });

  if (!post) return null;

  return {
    ...post,
    voteCount: post._count.votes,
    commentCount: post._count.comments,
    hasVoted: userId ? Array.isArray(post.votes) && post.votes.length > 0 : false,
  };
}
