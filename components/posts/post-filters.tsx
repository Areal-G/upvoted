"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_LABELS } from "@/lib/constants";

const STATUS_VALUES = ["OPEN", "PLANNED", "IN_PROGRESS", "DONE", "REJECTED"] as const;

export function PostFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentStatus = params.get("status") ?? "all";
  const currentSort = params.get("sort") ?? "new";

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value === null || value === "all") next.delete(key);
    else next.set(key, value);
    next.delete("page"); // reset pagination on filter change
    startTransition(() => {
      router.push(`${pathname}?${next.toString()}`);
    });
  }

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3"
      data-pending={isPending ? "" : undefined}
    >
      {/* Scrolls sideways on phones instead of cutting off the last tabs */}
      <Tabs
        value={currentStatus}
        onValueChange={(v) => setParam("status", v)}
        className="max-w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <TabsList className="w-max">
          <TabsTrigger value="all">All</TabsTrigger>
          {STATUS_VALUES.map((s) => (
            <TabsTrigger key={s} value={s}>
              {STATUS_LABELS[s]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Select value={currentSort} onValueChange={(v) => setParam("sort", v)}>
        <SelectTrigger className="w-36">
          <SelectValue>{currentSort === "top" ? "Most voted" : "Newest"}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="new">Newest</SelectItem>
          <SelectItem value="top">Most voted</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
