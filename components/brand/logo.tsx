import Link from "next/link";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = { href?: string; className?: string };

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "bg-primary text-primary-foreground inline-flex h-7 w-7 items-center justify-center rounded-lg",
        className,
      )}
    >
      <ChevronUp className="h-4 w-4" strokeWidth={3} />
    </span>
  );
}

export function Logo({ href = "/", className }: Props) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2 font-semibold", className)}>
      <LogoMark />
      <span>Upvoted</span>
    </Link>
  );
}
