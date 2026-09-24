import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { HotelImage } from "./hotel-image";
import { RatingStars } from "./rating-stars";
import { nightlyRateFor, formatINR } from "@/lib/format";
import type { Hotel } from "@/lib/api/types";

// The ONE card shape (DESIGN.md §8.4): image → location → serif name →
// rating → price → CTA. Fixed proportions so long names or extra badges never
// break the grid.

export function HotelCard({ hotel }: { hotel: Hotel }) {
  const { rate, estimated } = nightlyRateFor(hotel);

  return (
    <Link
      href={`/hotel/${hotel.id}`}
      className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 transition-shadow hover:shadow-lg hover:shadow-black/5"
    >
      <HotelImage hotelId={hotel.id} name={hotel.name} location={hotel.location} />
      <div className="flex flex-col gap-1.5 px-1 pb-1">
        <p className="flex items-center gap-1 text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
          <MapPin className="size-3" />
          <span className="truncate">{hotel.address}</span>
        </p>
        <h3 className="font-display truncate text-xl leading-snug font-semibold text-foreground">
          {hotel.name}
        </h3>
        <div className="flex items-center justify-between gap-2">
          <RatingStars rating={hotel.rating} />
          {hotel.ratingCount != null && hotel.ratingCount > 0 && (
            <span className="text-xs text-muted-foreground">({hotel.ratingCount})</span>
          )}
        </div>
        <div className="mt-1 flex items-end justify-between gap-2 border-t border-border pt-2.5">
          <p className="text-sm">
            <span className="font-semibold text-primary">{formatINR(rate)}</span>{" "}
            <span className="text-muted-foreground">/ night{estimated ? "*" : ""}</span>
          </p>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground">
            View stay
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
