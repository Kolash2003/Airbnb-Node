import { Star } from "lucide-react";
import { cn } from "cn";

/** Backend rating is an int (typically 1–5). Restrained gold, used for stars only. */
export function RatingStars({
  rating,
  className,
}: {
  rating: number | null | undefined;
  className?: string;
}) {
  if (rating == null) {
    return <span className={cn("text-xs text-muted-foreground", className)}>New stay</span>;
  }
  const full = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <span className={cn("inline-flex items-center gap-1", className)} aria-label={`Rated ${full} out of 5`}>
      <span className="inline-flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={cn(
              "size-3.5",
              i < full ? "fill-amber-500 text-amber-500" : "fill-muted text-muted",
            )}
          />
        ))}
      </span>
      <span className="text-xs font-medium text-foreground">{full.toFixed(1)}</span>
    </span>
  );
}
