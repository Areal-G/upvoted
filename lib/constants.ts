import type { PostStatusValue } from "@/lib/validators/posts";

export const POSTS_PER_PAGE = 10;

export const STATUS_LABELS: Record<PostStatusValue, string> = {
  OPEN: "Open",
  PLANNED: "Planned",
  IN_PROGRESS: "In progress",
  DONE: "Done",
  REJECTED: "Rejected",
};

export const STATUS_COLORS: Record<PostStatusValue, string> = {
  OPEN: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  PLANNED: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  IN_PROGRESS: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  DONE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  REJECTED: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
};
