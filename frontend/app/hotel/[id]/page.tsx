"use client";

import * as React from "react";
import Link from "next/link";
import { notFound, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, CalendarDays, MapPin, Users } from "lucide-react";
import { HotelImage } from "@/components/hotel-image";
import { RatingStars } from "@/components/rating-stars";
import { RoomTypePicker } from "@/components/room-type-picker";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getHotel } from "@/lib/api/hotel";
import { ApiError, friendlyMessage } from "@/lib/api/client";
import {
  bookingTotal,
  formatDateLabel,
  formatINR,
  nightlyRateFor,
  nightsBetween,
  pickBestFitRoom,
  roomLabel,
} from "@/lib/format";
import type { RoomCategory } from "@/lib/api/types";

export default function HotelDetailPage(props: PageProps<"/hotel/[id]">) {
  return (
    <React.Suspense>
      <HotelDetailContent idPromise={props.params} />
    </React.Suspense>
  );
}

function HotelDetailContent({ idPromise }: { idPromise: Promise<{ id: string }> }) {
  const { id } = React.use(idPromise);
  const searchParams = useSearchParams();
  const checkin = searchParams.get("checkin");
  const checkout = searchParams.get("checkout");
  const guests = Number(searchParams.get("guests") ?? "2") || 2;

  const {
    data: hotel,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["hotel", id],
    queryFn: () => getHotel(id),
    retry: false,
  });

  const [selectedRoomId, setSelectedRoomId] = React.useState<number | undefined>(undefined);

  // Default to the best-fit room for the searched guest count once the hotel
  // (and its room types) arrive — e.g. guests=3 picks the 3-person room, not
  // the cheapest single.
  const roomCategories = React.useMemo(() => hotel?.roomCategories ?? [], [hotel]);
  const bestFit = React.useMemo(
    () => pickBestFitRoom(roomCategories, guests)?.id,
    [roomCategories, guests],
  );
  const selectedRoom: RoomCategory | undefined =
    roomCategories.find((c) => c.id === selectedRoomId) ??
    roomCategories.find((c) => c.id === bestFit) ??
    undefined;

  if (isError && error instanceof ApiError && error.code === "not-found") {
    notFound();
  }

  const fallbackRate = hotel ? nightlyRateFor(hotel) : null;
  const rate = selectedRoom ? { rate: selectedRoom.price, estimated: false } : fallbackRate;

  const bookHref = hotel
    ? `/book?hotelId=${hotel.id}${
        checkin ? `&checkin=${checkin}&checkout=${checkout ?? ""}` : ""
      }&guests=${guests}${selectedRoom ? `&roomCategoryId=${selectedRoom.id}` : ""}`
    : "/";

  const backHref = searchParams.toString() ? `/?${searchParams.toString()}` : "/";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
      <Button variant="ghost" size="sm" nativeButton={false} render={<Link href={backHref} />} className="w-fit">
        <ArrowLeft className="size-4" /> All stays
      </Button>

      {isPending ? (
        <DetailSkeleton />
      ) : isError || !hotel ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-destructive/30 bg-card px-6 py-16 text-center">
          <h3 className="font-display text-2xl font-semibold">Couldn&apos;t load this stay</h3>
          <p className="max-w-sm text-sm text-muted-foreground">{friendlyMessage(error)}</p>
          <Button variant="outline" nativeButton={false} render={<Link href={backHref} />}>
            Back to all stays
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Same 4:3 card treatment as the listing — one crop everywhere. */}
          <div className="lg:col-span-3">
            <div className="group">
              <HotelImage hotelId={hotel.id} name={hotel.name} location={hotel.location} />
            </div>
            <div className="mt-6 flex flex-col gap-4">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
                  <MapPin className="size-3.5" /> {hotel.location}
                </p>
                <h1 className="font-display mt-1 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                  {hotel.name}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">{hotel.address}</p>
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <RatingStars rating={hotel.rating} />
                {hotel.ratingCount != null && hotel.ratingCount > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {hotel.ratingCount} verified rating{hotel.ratingCount === 1 ? "" : "s"}
                  </span>
                )}
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <h2 className="font-display text-xl font-semibold">Good to know</h2>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
                  <li>Check-in from 2:00 PM · check-out until 11:00 AM.</li>
                  <li>Free cancellation up to 48 hours before check-in.</li>
                  <li>Room assignment is confirmed right after you book.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Sticky booking panel + room-type picker — the summary that
              survives the flow starts here. */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            {roomCategories.length > 0 ? (
              <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
                <h2 className="font-display text-xl font-semibold">Choose your room</h2>
                <p className="-mt-1 text-sm text-muted-foreground">
                  {guests} guest{guests === 1 ? "" : "s"} — best fit picked for you.
                </p>
                <RoomTypePicker
                  categories={roomCategories}
                  selectedId={selectedRoom?.id}
                  onSelect={setSelectedRoomId}
                />
              </section>
            ) : null}
            <BookingPanel
              hotelId={hotel.id}
              nightlyRate={rate?.rate ?? 0}
              rateEstimated={rate?.estimated ?? false}
              roomLabel={selectedRoom ? roomLabel(selectedRoom.roomType) : undefined}
              checkin={checkin}
              checkout={checkout}
              guests={guests}
              bookHref={bookHref}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function BookingPanel({
  nightlyRate,
  rateEstimated,
  roomLabel: room,
  checkin,
  checkout,
  guests,
  bookHref,
}: {
  hotelId: number;
  nightlyRate: number;
  rateEstimated: boolean;
  roomLabel?: string;
  checkin: string | null;
  checkout: string | null;
  guests: number;
  bookHref: string;
}) {
  const validDates = Boolean(checkin && checkout);
  const nights = validDates ? nightsBetween(checkin!, checkout!) : 0;
  const totals = validDates && nights > 0 ? bookingTotal(nightlyRate, nights) : null;

  return (
    <aside className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-24">
      <p className="text-sm">
        <span className="text-2xl font-semibold text-primary">{formatINR(nightlyRate)}</span>{" "}
        <span className="text-muted-foreground">/ night{rateEstimated ? "*" : ""}</span>
      </p>

      <div className="flex flex-col gap-2 rounded-xl bg-muted/60 p-3.5 text-sm">
        <span className="flex items-center gap-2">
          <CalendarDays className="size-4 text-muted-foreground" />
          {validDates ? (
            <span>
              {formatDateLabel(checkin!)} → {formatDateLabel(checkout!)}
            </span>
          ) : (
            <span className="text-muted-foreground">You&apos;ll pick dates next</span>
          )}
        </span>
        <span className="flex items-center gap-2">
          <Users className="size-4 text-muted-foreground" />
          {guests} guest{guests === 1 ? "" : "s"}
          {totals ? ` · ${nights} night${nights === 1 ? "" : "s"}` : ""}
          {room ? ` · ${room} room` : ""}
        </span>
      </div>

      {totals && (
        <dl className="flex flex-col gap-1.5 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">
              {formatINR(nightlyRate)} × {nights} night{nights === 1 ? "" : "s"}
            </dt>
            <dd>{formatINR(totals.subtotal)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Service fee</dt>
            <dd>{formatINR(totals.fee)}</dd>
          </div>
          <div className="flex items-center justify-between pt-1 text-base font-semibold">
            <dt>Total</dt>
            <dd className="text-primary">{formatINR(totals.total)}</dd>
          </div>
        </dl>
      )}

      <Button size="lg" nativeButton={false} render={<Link href={bookHref} />} className="h-12 w-full">
        {validDates ? "Continue to book" : "Choose dates & book"}
        <ArrowRight className="size-4" />
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        {rateEstimated
          ? "*Estimated rate — the exact total is confirmed before you pay."
          : "No charge yet — you confirm everything on the next step."}
      </p>
    </aside>
  );
}

function DetailSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
      <div className="flex flex-col gap-4 lg:col-span-3">
        <Skeleton className="aspect-[4/3] w-full rounded-xl" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-80 w-full rounded-2xl lg:col-span-2" />
    </div>
  );
}