"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { changeStatus } from "@/server/actions/posts";
import { STATUS_LABELS } from "@/lib/constants";
import type { PostStatusValue } from "@/lib/validators/posts";

type Props = {
  postId: string;
  current: PostStatusValue;
  children: React.ReactNode;
};

const STATUS_VALUES: PostStatusValue[] = ["OPEN", "PLANNED", "IN_PROGRESS", "DONE", "REJECTED"];

export function AdminStatusSelect({ postId, current, children }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleSelect(status: PostStatusValue) {
    if (status === current) return;
    startTransition(async () => {
      const result = await changeStatus({ postId, status });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`Status changed to ${STATUS_LABELS[status]}`);
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={isPending}
        className="focus:ring-ring cursor-pointer rounded-md outline-none focus:ring-2"
      >
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {STATUS_VALUES.map((s) => (
          <DropdownMenuItem key={s} onSelect={() => handleSelect(s)}>
            {STATUS_LABELS[s]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
