import Link from "next/link";
import { MessageSquare, ChevronUp } from "lucide-react";
import { StatusBadge } from "./status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { PublicPost } from "@/server/queries/posts";

type Props = { post: PublicPost; slug: string };

export function PostCard({ post, slug }: Props) {
  return (
    <article className="bg-card hover:border-foreground/20 flex gap-4 rounded-lg border p-4 transition">
      <div
        className={cn(
          "flex flex-col items-center gap-0.5 rounded-md border px-3 py-2 text-sm",
          post.hasVoted
            ? "border-primary bg-primary/10 text-primary"
            : "border-border text-muted-foreground",
        )}
        aria-hidden
      >
        <ChevronUp className="h-4 w-4" />
        <span className="font-medium tabular-nums">{post.voteCount}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/b/${slug}/posts/${post.id}`} className="font-medium hover:underline">
            {post.title}
          </Link>
          <StatusBadge status={post.status} />
        </div>
        <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">{post.content}</p>

        <div className="text-muted-foreground mt-3 flex items-center gap-3 text-xs">
          {post.author && (
            <div className="flex items-center gap-1.5">
              <Avatar className="h-5 w-5">
                <AvatarImage src={post.author.image ?? undefined} />
                <AvatarFallback className="text-[10px]">
                  {(post.author.name ?? "?").slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{post.author.name ?? "Anonymous"}</span>
            </div>
          )}
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
