"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteComment } from "@/server/actions/comments";

type Props = {
  comment: {
    id: string;
    content: string;
    createdAt: Date;
    authorId: string;
    author: { name: string | null; image: string | null } | null;
  };
  canDelete: boolean;
};

export function CommentItem({ comment, canDelete }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this comment?")) return;
    startTransition(async () => {
      const result = await deleteComment({ commentId: comment.id });
      if (!result.ok) toast.error(result.error);
    });
  }

  return (
    <div className="flex gap-3 py-3">
      <Avatar className="h-7 w-7">
        <AvatarImage src={comment.author?.image ?? undefined} />
        <AvatarFallback className="text-xs">
          {(comment.author?.name ?? "?").slice(0, 1).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <span className="text-foreground font-medium">{comment.author?.name ?? "Anonymous"}</span>
          <span>·</span>
          <time dateTime={comment.createdAt.toISOString()}>
            {comment.createdAt.toLocaleDateString()}
          </time>
          {canDelete && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isPending}
              className="ml-auto h-6 px-2"
              aria-label="Delete comment"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
        <p className="mt-1 text-sm whitespace-pre-wrap">{comment.content}</p>
      </div>
    </div>
  );
}
