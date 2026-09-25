"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Heart, MapPin, X } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { listHotels } from "@/lib/api/hotel";
import { friendlyMessage } from "@/lib/api/client";
import { useFavorites } from "@/lib/favorites";
import { formatINR, nightlyRateFor } from "@/lib/format";

export function FavoritesCard() {
  const { favorites, toggleFavorite } = useFavorites();
  const { data: hotels, isPending, isError, error } = useQuery({
    queryKey: ["hotels"],
    queryFn: () => listHotels(),
  });

  const saved = (hotels ?? []).filter((h) => favorites.includes(h.id));

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
      <div>
        <h2 className="font-display flex items-center gap-2 text-xl font-semibold">
          <Heart className="size-4 text-muted-foreground" /> Wishlist
        </h2>
        <p className="text-sm text-muted-foreground">
          Stays you saved with the heart on any card.
        </p>
      </div>

      {isPending ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 2 }, (_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-sm text-muted-foreground">{friendlyMessage(error)}</p>
      ) : saved.length === 0 ? (
        <EmptyState
          title="Nothing saved yet"
          body="Tap the heart on any stay to keep it here for later."
          actionHref="/"
          actionLabel="Browse stays"
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {saved.map((hotel) => {
            const { rate } = nightlyRateFor(hotel);
            return (
              <li
                key={hotel.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/60 px-4 py-3"
              >
                <Link href={`/hotel/${hotel.id}`} className="group min-w-0 flex-1">
                  <p className="truncate text-sm font-medium group-hover:underline">{hotel.name}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3 shrink-0" />
                    <span className="truncate">{hotel.location}</span>
                    <span className="ml-auto shrink-0 font-medium text-foreground">
                      {formatINR(rate)}
                      <span className="text-muted-foreground">/night</span>
                    </span>
                  </p>
                </Link>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${hotel.name} from wishlist`}
                  onClick={() => toggleFavorite(hotel.id)}
                >
                  <X className="size-4" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}