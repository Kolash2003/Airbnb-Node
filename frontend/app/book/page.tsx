"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Lock } from "lucide-react";
import { BookingSummary } from "@/components/booking-summary";
import { DateRangePicker } from "@/components/date-range-picker";
import { EmptyState } from "@/components/empty-state";
import { GuestStepper } from "@/components/guest-stepper";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getHotel } from "@/lib/api/hotel";
import { createBooking } from "@/lib/api/booking";
import { friendlyMessage } from "@/lib/api/client";
import { useSession } from "@/lib/auth/session";
import {
  IDEMPOTENCY_KEY_KEY,
  bookingTotal,
  nightlyRateFor,
  nightsBetween,
} from "@/lib/format";

export default function BookPage() {
  return (
    <React.Suspense>
      <BookContent />
    </React.Suspense>
  );
}

function BookContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, ready } = useSession();

  const hotelId = params.get("hotelId");
  const [range, setRange] = React.useState<DateRange | undefined>(() => {
    try {
      const from = params.get("checkin") ? parseISO(params.get("checkin")!) : undefined;
      const to = params.get("checkout") ? parseISO(params.get("checkout")!) : undefined;
      if (from && !Number.isNaN(from.getTime())) {
        return {
          from,
          to: to && !Number.isNaN(to.getTime()) && to > from ? to : undefined,
        };
      }
    } catch {
      /* fall through to empty */
    }
    return undefined;
  });
  const [guests, setGuests] = React.useState(Number(params.get("guests") ?? "2") || 2);

  const { data: hotel, isPending, isError } = useQuery({
    queryKey: ["hotel", hotelId],
    queryFn: () => getHotel(hotelId!),
    enabled: Boolean(hotelId),
    retry: false,
  });

  // Step 1 of the two-step flow. Single-fire: the button disables while the
  // mutation is pending, and the idempotency key exists precisely so a retry
  // can never double-book (§4.9).
  const create = useMutation({
    mutationFn: () => {
      const checkin = format(range!.from!, "yyyy-MM-dd");
      const checkout = format(range!.to!, "yyyy-MM-dd");
      const { total } = bookingTotal(nightlyRateFor(hotel!).rate, nightsBetween(checkin, checkout));
      return createBooking({
        userId: user!.id,
        hotelId: hotel!.id,
        totalGuests: guests,
        bookingAmount: total,
      });
    },
    onSuccess: ({ bookingId, idempotencyKey }) => {
      window.sessionStorage.setItem(IDEMPOTENCY_KEY_KEY, idempotencyKey);
      const qp = new URLSearchParams({
        hotelId: String(hotel!.id),
        checkin: format(range!.from!, "yyyy-MM-dd"),
        checkout: format(range!.to!, "yyyy-MM-dd"),
        guests: String(guests),
      });
      router.push(`/book/confirm/${idempotencyKey}?${qp.toString()}`);
      toast.success(`Booking #${bookingId} created — confirming…`);
    },
    onError: (err) => toast.error(friendlyMessage(err)),
  });

  if (!hotelId) {
    return (
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 sm:px-6">
        <EmptyState
          title="No stay selected"
          body="Pick a stay first — your dates and guests will carry over into the booking."
          actionHref="/"
          actionLabel="Find a stay"
        />
      </div>
    );
  }

  const checkin = range?.from ? format(range.from, "yyyy-MM-dd") : null;
  const checkout = range?.to ? format(range.to, "yyyy-MM-dd") : null;
  const nights = checkin && checkout ? nightsBetween(checkin, checkout) : 0;
  const canSubmit = Boolean(user && hotel && nights > 0 && !create.isPending);
  const loginNext = `/book?hotelId=${hotelId}${
    checkin ? `&checkin=${checkin}&checkout=${checkout}` : ""
  }&guests=${guests}`;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <Button variant="ghost" size="sm" nativeButton={false} render={<Link href={hotel ? `/hotel/${hotel.id}` : "/"} />} className="w-fit">
        <ArrowLeft className="size-4" /> Back
      </Button>

      <div>
        <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
          Step 1 of 2 — Review
        </p>
        <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
          Review your trip
        </h1>
      </div>

      {isPending ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      ) : isError || !hotel ? (
        <EmptyState
          title="That stay is unavailable"
          body="It may have been removed. Pick another stay — your dates are kept in the link."
          actionHref="/"
          actionLabel="Browse all stays"
        />
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-5 lg:col-span-2">
            {/* Trip details — editable here so nothing is a dead end. */}
            <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
              <h2 className="font-display text-xl font-semibold">Trip details</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Dates</span>
                  <DateRangePicker range={range} onChange={setRange} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Guests</span>
                  <div className="flex h-12 items-center rounded-xl border border-input bg-background px-3.5">
                    <GuestStepper guests={guests} onChange={setGuests} />
                    <span className="ml-3 text-sm text-muted-foreground">
                      guest{guests === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>
              </div>
              {nights === 0 && (
                <p className="text-sm text-muted-foreground">
                  Select a check-in and check-out date to see your total.
                </p>
              )}
            </section>

            {/* Auth gate: the booking service needs a userId from the session. */}
            {ready && !user ? (
              <section className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-5">
                <h2 className="font-display text-xl font-semibold">Sign in to book</h2>
                <p className="text-sm text-muted-foreground">
                  Your trip details are saved in this page&apos;s link — sign in
                  and you&apos;ll land right back here.
                </p>
                <Button nativeButton={false} render={<Link href={`/login?next=${encodeURIComponent(loginNext)}`} />}>
                  Sign in
                </Button>
              </section>
            ) : (
              <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
                <h2 className="font-display text-xl font-semibold">Confirm</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  This creates the booking and holds your room. You&apos;ll get
                  a confirmation on the next step — nothing is charged until the
                  stay confirms availability.
                </p>
                <Button
                  size="lg"
                  className="h-12 w-full sm:w-auto"
                  disabled={!canSubmit}
                  onClick={() => create.mutate()}
                >
                  {create.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Creating booking…
                    </>
                  ) : (
                    <>
                      <Lock className="size-4" /> Confirm booking
                    </>
                  )}
                </Button>
              </section>
            )}
          </div>

          {/* Persistent summary — survives the whole flow (§8.6). */}
          <BookingSummary
            hotel={hotel}
            nightlyRate={nightlyRateFor(hotel).rate}
            rateEstimated={nightlyRateFor(hotel).estimated}
            checkin={checkin ?? format(new Date(), "yyyy-MM-dd")}
            checkout={checkout ?? format(new Date(), "yyyy-MM-dd")}
            guests={guests}
          />
        </div>
      )}
    </div>
  );
}
