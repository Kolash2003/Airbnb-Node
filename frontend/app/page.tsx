"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import type { DateRange } from "react-day-picker";
import { RotateCcw } from "lucide-react";
import { SearchBar, type SearchValues } from "@/components/search-bar";
import { HotelCard } from "@/components/hotel-card";
import { HotelCardSkeleton } from "@/components/hotel-card-skeleton";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listHotels } from "@/lib/api/hotel";
import { friendlyMessage } from "@/lib/api/client";
import { nightlyRateFor } from "@/lib/format";

type SortKey = "recommended" | "price-asc" | "price-desc" | "name";

const RATING_OPTIONS = [
  { value: "0", label: "Any rating" },
  { value: "3", label: "3+ stars" },
  { value: "4", label: "4+ stars" },
  { value: "5", label: "5 stars only" },
];

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name A–Z" },
];

function toISODate(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

function parseRange(checkin: string | null, checkout: string | null): DateRange | undefined {
  if (!checkin) return undefined;
  try {
    const from = parseISO(checkin);
    if (Number.isNaN(from.getTime())) return undefined;
    if (!checkout) return { from, to: undefined };
    const to = parseISO(checkout);
    if (Number.isNaN(to.getTime()) || to <= from) return { from, to: undefined };
    return { from, to };
  } catch {
    return undefined;
  }
}

export default function HomePage() {
  return (
    <React.Suspense>
      <HomeContent />
    </React.Suspense>
  );
}

function HomeContent() {
  const router = useRouter();
  const params = useSearchParams();

  const destination = params.get("destination") ?? "";
  const range = parseRange(params.get("checkin"), params.get("checkout"));
  const guests = Number(params.get("guests") ?? "2") || 2;
  const sort = (params.get("sort") as SortKey) || "recommended";
  const minRating = Number(params.get("minRating") ?? "0") || 0;

  const checkin = range?.from ? toISODate(range.from) : undefined;
  const checkout = range?.to ? toISODate(range.to) : undefined;

  const { data: hotels, isPending, isError, error, refetch } = useQuery({
    queryKey: ["hotels", destination, checkin, checkout, guests],
    queryFn: () =>
      listHotels({
        q: destination.trim() || undefined,
        checkin,
        checkout,
        guests,
      }),
  });

  const initial: SearchValues = React.useMemo(
    () => ({ destination, range, guests }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [params],
  );

  const updateParams = (next: Record<string, string | null | undefined>) => {
    const merged = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) merged.set(k, v);
      else merged.delete(k);
    }
    router.replace(`/?${merged.toString()}`, { scroll: false });
  };

  const onSearch = (v: SearchValues) => {
    updateParams({
      destination: v.destination.trim() || undefined,
      checkin: v.range?.from ? toISODate(v.range.from) : undefined,
      checkout: v.range?.to ? toISODate(v.range.to) : undefined,
      guests: String(v.guests),
    });
  };

  const results = React.useMemo(() => {
    if (!hotels) return [];
    const filtered = hotels.filter((h) => {
      if (minRating > 0 && (h.rating ?? 0) < minRating) return false;
      return true;
    });
    const withRate = filtered.map((h) => ({ h, rate: nightlyRateFor(h).rate }));
    const guestsActive = guests > 0;
    switch (sort) {
      case "price-asc":
        withRate.sort((a, b) => a.rate - b.rate);
        break;
      case "price-desc":
        withRate.sort((a, b) => b.rate - a.rate);
        break;
      case "name":
        withRate.sort((a, b) => a.h.name.localeCompare(b.h.name));
        break;
      default:
        // Best-fit-first: hotels whose largest room just fits the searched
        // guest count rank above roomier ones, then by rating.
        withRate.sort((a, b) => {
          if (guestsActive) {
            const fa = a.h.maxOccupancy != null ? a.h.maxOccupancy - guests : Number.POSITIVE_INFINITY;
            const fb = b.h.maxOccupancy != null ? b.h.maxOccupancy - guests : Number.POSITIVE_INFINITY;
            if (fa !== fb) return fa - fb;
          }
          return (b.h.rating ?? 0) - (a.h.rating ?? 0);
        });
    }
    return withRate.map((r) => r.h);
  }, [hotels, minRating, sort, guests]);

  const hasFilters = destination.trim() !== "" || minRating > 0;
  const search = params.toString();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 pt-10 pb-16 sm:px-6 sm:pt-14">
      {/* Hero: the search bar owns the fold. */}
      <section className="flex flex-col items-center gap-6 text-center">
        <div className="max-w-2xl space-y-3">
          <h1 className="font-display text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl">
            Find a stay worth remembering.
          </h1>
          <p className="text-base text-muted-foreground sm:text-lg">
            Boutique hotels with honest, per-night pricing. The total you see is
            the total you pay.
          </p>
        </div>
        <div className="w-full max-w-4xl">
          <SearchBar initial={initial} onSearch={onSearch} />
        </div>
      </section>

      {/* Results */}
      <section className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground" role="status">
            {isPending
              ? "Looking for stays…"
              : `${results.length} stay${results.length === 1 ? "" : "s"}${
                  destination.trim() ? ` matching “${destination.trim()}”` : ""
                }`}
          </p>
          <div className="flex items-center gap-2">
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  updateParams({ destination: undefined, minRating: undefined })
                }
              >
                <RotateCcw className="size-3.5" /> Clear
              </Button>
            )}
            <Select
              value={String(minRating)}
              onValueChange={(v) =>
                updateParams({ minRating: v === "0" ? undefined : v })
              }
            >
              <SelectTrigger size="sm" className="w-32" aria-label="Minimum rating">
                <SelectValue>
                  {RATING_OPTIONS.find((o) => o.value === String(minRating))?.label ?? "Any rating"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {RATING_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={sort}
              onValueChange={(v) => updateParams({ sort: v })}
            >
              <SelectTrigger size="sm" className="w-40" aria-label="Sort stays">
                <SelectValue>
                  {SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Recommended"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isPending ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <HotelCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-destructive/30 bg-card px-6 py-16 text-center">
            <h3 className="font-display text-2xl font-semibold">We can&apos;t reach the hotel service</h3>
            <p className="max-w-sm text-sm text-muted-foreground">{friendlyMessage(error)}</p>
            <Button variant="outline" onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        ) : results.length === 0 ? (
          <EmptyState
            title={hasFilters ? "No stays match those filters" : "No stays yet"}
            body={
              hasFilters
                ? "Try a nearby destination or drop the rating filter — new stays are added by hosts every week."
                : "There are no stays listed right now. Hosts can add one from the Manage page."
            }
            actionHref={hasFilters ? "/" : "/admin"}
            actionLabel={hasFilters ? "Browse all stays" : "Add the first stay"}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} searchParams={search} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              * Estimated nightly rate — the host hasn&apos;t published pricing
              for this stay yet. The exact total is confirmed before you pay.
            </p>
          </>
        )}
      </section>
    </div>
  );
}
