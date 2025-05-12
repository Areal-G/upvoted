"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = { currentPage: number; totalPages: number };

export function BoardPagination({ currentPage, totalPages }: Props) {
  const pathname = usePathname();
  const params = useSearchParams();

  function buildHref(page: number) {
    const next = new URLSearchParams(params.toString());
    if (page === 1) next.delete("page");
    else next.set("page", String(page));
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  const prevDisabled = currentPage <= 1;
  const nextDisabled = currentPage >= totalPages;

  return (
    <nav className="flex items-center justify-between text-sm">
      <Button asChild variant="outline" size="sm" disabled={prevDisabled}>
        <Link
          href={buildHref(currentPage - 1)}
          aria-disabled={prevDisabled}
          className={prevDisabled ? "pointer-events-none opacity-50" : undefined}
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Previous
        </Link>
      </Button>
      <span className="text-muted-foreground">
        Page {currentPage} of {totalPages}
      </span>
      <Button asChild variant="outline" size="sm" disabled={nextDisabled}>
        <Link
          href={buildHref(currentPage + 1)}
          aria-disabled={nextDisabled}
          className={nextDisabled ? "pointer-events-none opacity-50" : undefined}
        >
          Next <ChevronRight className="ml-1 h-4 w-4" />
        </Link>
      </Button>
    </nav>
  );
}
