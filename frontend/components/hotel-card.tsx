"use client";

import Link from "next/link";
import { ArrowRight, Heart, MapPin, Users } from "lucide-react";
import { cn } from "cn";
import { HotelImage } from "./hotel-image";
import { RatingStars } from "./rating-stars";
import { nightlyRateFor, formatINR } from "@/lib/format";
import { useFavorites } from "@/lib/favorites";
import type { Hotel } from "@/lib/api/types";

// The ONE card shape (DESIGN.md §8.4): image → location → serif name →
// rating → price → CTA. Fixed proportions so long names or extra badges never
// break the grid.

export function HotelCard({
  hotel,
  searchParams,
}: {
  hotel: Hotel;
  searchParams?: string;
}) {
  const { rate, estimated } = nightlyRateFor(hotel);
  const { favorites, toggleFavorite } = useFavorites();
  const saved = favorites.includes(hotel.id);
  const href = searchParams ? `/hotel/${hotel.id}?${searchParams}` : `/hotel/${hotel.id}`;

  return (
    <Link
      href={href}
      className="group relative flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 transition-shadow hover:shadow-lg hover:shadow-black/5"
    >
      <button
        type="button"
        aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
        aria-pressed={saved}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite(hotel.id);
        }}
        className="absolute top-4 right-4 z-10 flex size-8 items-center justify-center rounded-full bg-background/90 shadow-sm backdrop-blur transition-colors hover:bg-background"
      >
        <Heart
          className={cn("size-4", saved ? "fill-primary text-primary" : "text-muted-foreground")}
        />
      </button>
      <HotelImage hotelId={hotel.id} name={hotel.name} location={hotel.location} />
      <div className="flex flex-col gap-1.5 px-1 pb-1">
        <p className="flex items-center gap-1 text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
          <MapPin className="size-3" />
          <span className="truncate">{hotel.address}</span>
        </p>
        <h3 className="font-display truncate text-xl leading-snug font-semibold text-foreground">
          {hotel.name}
        </h3>
        {hotel.maxOccupancy != null && hotel.maxOccupancy > 0 && (
          <span className="flex w-fit items-center gap-1 rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            <Users className="size-3" /> Fits up to {hotel.maxOccupancy} guest
            {hotel.maxOccupancy === 1 ? "" : "s"}
          </span>
        )}
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
