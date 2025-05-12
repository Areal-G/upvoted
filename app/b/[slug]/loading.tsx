import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8 border-b pb-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="mt-2 h-4 w-2/3" />
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="mt-6 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    </main>
  );
}
