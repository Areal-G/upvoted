import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { StatusBadge } from "./status-badge";
import { VoteButton } from "./vote-button";
import type { PublicPost } from "@/server/queries/posts";

type Props = { post: PublicPost; slug: string; authenticated: boolean };

export function PostCard({ post, slug, authenticated }: Props) {
  return (
    <article className="bg-card hover:border-foreground/20 flex gap-4 rounded-lg border p-4 transition">
      <VoteButton
        postId={post.id}
        voteCount={post.voteCount}
        hasVoted={post.hasVoted}
        authenticated={authenticated}
        boardSlug={slug}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/b/${slug}/posts/${post.id}`} className="font-medium hover:underline">
            {post.title}
          </Link>
          <StatusBadge status={post.status} />
        </div>
        <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">{post.content}</p>

        <div className="text-muted-foreground mt-3 flex items-center gap-3 text-xs">
          {post.category && (
            <span
              className="rounded px-1.5 py-0.5 text-[11px]"
              style={{ backgroundColor: `${post.category.color}20`, color: post.category.color }}
            >
              {post.category.name}
            </span>
          )}
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {post.commentCount}
          </span>
        </div>
      </div>
    </article>
  );
}
