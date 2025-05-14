import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="mb-8 border-b pb-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="mt-2 h-4 w-2/3" />
      </div>
      <Skeleton className="h-6 w-32" />
      <div className="mt-4 mb-12 grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-72 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="mt-6 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    </main>
  );
}
