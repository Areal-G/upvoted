"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deletePost } from "@/server/actions/posts";

export function DeletePostButton({ postId }: { postId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    startTransition(async () => {
      const result = await deletePost({ postId });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Post deleted");
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      aria-label="Delete post"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
