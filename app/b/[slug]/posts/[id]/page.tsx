import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { getPostById } from "@/server/queries/posts";
import { listPostComments, type PublicComment } from "@/server/queries/comments";
import { StatusBadge } from "@/components/posts/status-badge";
import { VoteButton } from "@/components/posts/vote-button";
import { CommentForm } from "@/components/posts/comment-form";
import { CommentItem } from "@/components/posts/comment-item";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = { params: Promise<{ slug: string; id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) return { title: "Not found" };
  return { title: post.title, description: post.content.slice(0, 160) };
}

export default async function PostDetailPage({ params }: Props) {
  const { slug, id } = await params;
  const post = await getPostById(id);
  if (!post || post.board.slug !== slug || !post.board.isPublic) notFound();

  const session = await auth();
  const comments = await listPostComments(id);
  const isBoardOwner = session?.user?.id === post.board.ownerId;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href={`/b/${slug}`}
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-4 w-4" /> Back to {post.board.name}
      </Link>

      <article className="flex gap-4">
        <VoteButton
          postId={post.id}
          voteCount={post.voteCount}
          hasVoted={post.hasVoted}
          authenticated={!!session?.user}
          boardSlug={slug}
          size="md"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold">{post.title}</h1>
            <StatusBadge status={post.status} />
          </div>

          <div className="text-muted-foreground mt-3 flex items-center gap-2 text-xs">
            {post.author && (
              <>
                <Avatar className="h-5 w-5">
                  <AvatarImage src={post.author.image ?? undefined} />
                  <AvatarFallback className="text-[10px]">
                    {(post.author.name ?? "?").slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{post.author.name ?? "Anonymous"}</span>
                <span>·</span>
              </>
            )}
            <time dateTime={post.createdAt.toISOString()}>
              {post.createdAt.toLocaleDateString()}
            </time>
          </div>

          <p className="mt-4 text-base whitespace-pre-wrap">{post.content}</p>
        </div>
      </article>

      <section className="mt-10">
        <h2 className="text-muted-foreground mb-4 text-sm font-semibold tracking-wide uppercase">
          Comments ({comments.length})
        </h2>

        <CommentForm postId={post.id} authenticated={!!session?.user} boardSlug={slug} />

        <div className="mt-6 divide-y">
          {comments.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">No comments yet.</p>
          ) : (
            comments.map((c: PublicComment) => (
              <CommentItem
                key={c.id}
                comment={c}
                canDelete={session?.user?.id === c.authorId || isBoardOwner}
              />
            ))
          )}
        </div>
      </section>
    </main>
  );
}
