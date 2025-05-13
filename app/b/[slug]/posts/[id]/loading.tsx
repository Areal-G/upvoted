import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Skeleton className="mb-6 h-5 w-32" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="mt-4 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-4/5" />
    </main>
  );
}
