import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";

export default function PublicBoardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">{children}</div>
      <footer className="border-t py-6">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground mx-auto flex w-fit items-center gap-2 text-xs"
        >
          <LogoMark className="h-5 w-5 rounded-md [&_svg]:h-3 [&_svg]:w-3" />
          Powered by Upvoted
        </Link>
      </footer>
    </div>
  );
}
