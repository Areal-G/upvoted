"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleVote } from "@/server/actions/votes";

type Props = {
  postId: string;
  voteCount: number;
  hasVoted: boolean;
  authenticated: boolean;
  boardSlug: string;
  size?: "sm" | "md";
};

export function VoteButton({
  postId,
  voteCount,
  hasVoted,
  authenticated,
  boardSlug,
  size = "sm",
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [optimistic, setOptimistic] = useOptimistic(
    { voteCount, hasVoted },
    (state, nextHasVoted: boolean) => ({
      voteCount: state.voteCount + (nextHasVoted ? 1 : -1),
      hasVoted: nextHasVoted,
    }),
  );

  function handleClick() {
    if (!authenticated) {
      router.push(`/login?callbackUrl=/b/${boardSlug}`);
      return;
    }
    startTransition(async () => {
      setOptimistic(!optimistic.hasVoted);
      try {
        const result = await toggleVote({ postId });
        if (!result.ok) {
          toast.error(result.error);
          router.refresh();
        }
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={optimistic.hasVoted}
      aria-label={size === "md" && optimistic.hasVoted ? "Remove vote" : "Vote"}
      className={cn(
        "flex flex-col items-center gap-0.5 rounded-md border transition",
        size === "sm" ? "px-3 py-2 text-sm" : "px-4 py-3 text-base",
        optimistic.hasVoted
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
        isPending && "opacity-60",
      )}
    >
      <ChevronUp className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
      <span className="font-medium tabular-nums">{optimistic.voteCount}</span>
    </button>
  );
}
