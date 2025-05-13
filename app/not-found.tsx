import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-muted-foreground text-sm font-medium">404</p>
      <h1 className="mt-2 text-3xl font-bold">Page not found</h1>
      <p className="text-muted-foreground mt-2 max-w-md text-sm">
        The page you’re looking for doesn’t exist or is private.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Back home</Link>
      </Button>
    </main>
  );
}
