"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createComment } from "@/server/actions/comments";

type Props = { postId: string; authenticated: boolean; boardSlug: string };

export function CommentForm({ postId, authenticated, boardSlug }: Props) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!authenticated) {
    return (
      <div className="text-muted-foreground rounded-md border border-dashed p-4 text-sm">
        <button
          type="button"
          onClick={() => router.push(`/login?callbackUrl=/b/${boardSlug}`)}
          className="text-foreground font-medium underline-offset-4 hover:underline"
        >
          Sign in
        </button>{" "}
        to leave a comment.
      </div>
    );
  }

  function handleSubmit() {
    if (!content.trim()) return;
    startTransition(async () => {
      const result = await createComment({ postId, content });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setContent("");
      textareaRef.current?.focus();
    });
  }

  return (
    <div className="space-y-2">
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a comment…"
        rows={3}
        maxLength={1000}
        disabled={isPending}
      />
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || content.trim().length === 0}
          size="sm"
        >
          {isPending ? "Posting…" : "Comment"}
        </Button>
      </div>
    </div>
  );
}
