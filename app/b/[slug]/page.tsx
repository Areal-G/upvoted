import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getBoardBySlug } from "@/server/queries/boards";
import { listBoardPosts, type PublicPost } from "@/server/queries/posts";
import { listPostsQuerySchema } from "@/lib/validators/posts";
import { POSTS_PER_PAGE } from "@/lib/constants";
import { PostCard } from "@/components/posts/post-card";
import { PostFilters } from "@/components/posts/post-filters";
import { CreatePostDialog } from "@/components/posts/create-post-dialog";
import { BoardPagination } from "@/components/board/board-pagination";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ status?: string; sort?: string; page?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const board = await getBoardBySlug(slug);
  if (!board) return { title: "Not found" };
  return {
    title: board.name,
    description: board.description ?? `Feedback board for ${board.name}`,
  };
}

export default async function PublicBoardPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;

  const board = await getBoardBySlug(slug);
  if (!board || !board.isPublic) notFound();

  const parsed = listPostsQuerySchema.safeParse({
    slug,
    status: sp.status,
    sort: sp.sort,
    page: sp.page,
  });
  if (!parsed.success) notFound();

  const session = await auth();
  const { posts, total } = await listBoardPosts(parsed.data);
  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8 flex items-start justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold">{board.name}</h1>
          {board.description && <p className="text-muted-foreground mt-2">{board.description}</p>}
          <Link
            href={`/b/${slug}/roadmap`}
            className="text-muted-foreground hover:text-foreground mt-2 inline-block text-sm underline-offset-4 hover:underline"
          >
            View roadmap →
          </Link>
        </div>
        <CreatePostDialog boardSlug={slug} authenticated={!!session?.user} />
      </header>

      <div className="mb-6">
        <PostFilters />
      </div>

      {posts.length === 0 ? (
        <div className="text-muted-foreground rounded-md border border-dashed p-12 text-center text-sm">
          No posts match your filters yet. Be the first to suggest something.
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post: PublicPost) => (
            <PostCard key={post.id} post={post} slug={slug} authenticated={!!session?.user} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8">
          <BoardPagination currentPage={parsed.data.page} totalPages={totalPages} />
        </div>
      )}
    </main>
  );
}
