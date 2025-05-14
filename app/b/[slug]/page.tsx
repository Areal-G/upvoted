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
import { RoadmapColumns } from "@/components/board/roadmap-columns";
import { getBoardRoadmap } from "@/server/queries/roadmap";
import { Button } from "@/components/ui/button";
import { ArrowRight, Map } from "lucide-react";

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
  const [{ posts, total }, roadmap] = await Promise.all([
    listBoardPosts(parsed.data),
    getBoardRoadmap(board.id),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <header className="mb-8 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{board.name}</h1>
          {board.description && (
            <p className="text-muted-foreground mt-2 max-w-2xl">{board.description}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button asChild variant="outline">
            <Link href={`/b/${slug}/roadmap`}>
              <Map className="mr-1.5 h-4 w-4" /> Roadmap
            </Link>
          </Button>
          <CreatePostDialog boardSlug={slug} authenticated={!!session?.user} />
        </div>
      </header>

      <section aria-labelledby="roadmap-heading" className="mb-12">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 id="roadmap-heading" className="flex items-center gap-2 text-xl font-semibold">
              <Map className="text-primary h-5 w-5" /> Roadmap
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              What&apos;s planned, being built and already shipped.
            </p>
          </div>
          <Link
            href={`/b/${slug}/roadmap`}
            className="text-primary hidden shrink-0 items-center gap-1 text-sm font-medium hover:underline sm:inline-flex"
          >
            Full roadmap <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <RoadmapColumns slug={slug} roadmap={roadmap} limit={3} />
      </section>

      <section aria-labelledby="feedback-heading">
        <div className="mb-4">
          <h2 id="feedback-heading" className="text-xl font-semibold">
            All feedback
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Vote for the ideas you want most. The top-voted ones get built first.
          </p>
        </div>
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
      </section>
    </main>
  );
}
