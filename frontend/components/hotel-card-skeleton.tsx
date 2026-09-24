import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton mirrors HotelCard proportions so loading never shifts layout. */
export function HotelCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3">
      <Skeleton className="aspect-[4/3] w-full rounded-xl" />
      <div className="flex flex-col gap-1.5 px-1 pb-1">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-6 w-4/5" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="mt-1 h-8 w-full" />
      </div>
    </div>
  );
}
