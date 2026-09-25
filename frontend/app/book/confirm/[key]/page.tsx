"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowRight, Loader2, RotateCcw } from "lucide-react";
import { BookingSummary } from "@/components/booking-summary";
import { Button } from "@/components/ui/button";
import { getHotel } from "@/lib/api/hotel";
import { confirmBooking } from "@/lib/api/booking";
import { ApiError, friendlyMessage } from "@/lib/api/client";
import { bookingTotal, nightlyRateFor, nightsBetween, pickBestFitRoom, roomLabel } from "@/lib/format";

export default function ConfirmPage(props: PageProps<"/book/confirm/[key]">) {
  return (
    <React.Suspense>
      <ConfirmContent keyPromise={props.params} />
    </React.Suspense>
  );
}

function ConfirmContent({ keyPromise }: { keyPromise: Promise<{ key: string }> }) {
  const { key: idempotencyKey } = React.use(keyPromise);
  const params = useSearchParams();
  const hotelId = params.get("hotelId");
  const checkin = params.get("checkin") ?? "";
  const checkout = params.get("checkout") ?? "";
  const guests = Number(params.get("guests") ?? "2") || 2;
  const roomCategoryId = Number(params.get("roomCategoryId")) || undefined;

  const { data: hotel } = useQuery({
    queryKey: ["hotel", hotelId],
    queryFn: () => getHotel(hotelId!),
    enabled: Boolean(hotelId),
    retry: false,
  });

  // Step 2: finalize exactly once. A ref guards React 18 dev double-effects,
  // and the service itself rejects re-finalized keys — so even a retry that
  // slips through lands safely (§4.9).
  const fired = React.useRef(false);
  const confirm = useMutation({
    mutationFn: () => confirmBooking(idempotencyKey),
  });

  React.useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    confirm.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idempotencyKey]);

  // "Already finalized" means step 2 already succeeded (e.g. a refresh after
  // confirming) — show the confirmation, not an error.
  const alreadyDone =
    confirm.error instanceof ApiError &&
    confirm.error.status === 400 &&
    /finalized/i.test(confirm.error.message);
  const confirmed = confirm.isSuccess || alreadyDone;
  const bookingId = confirm.data?.bookingId;

  const nights = checkin && checkout ? nightsBetween(checkin, checkout) : 0;
  const selectedRoom =
    hotel?.roomCategories.find((c) => c.id === roomCategoryId) ??
    (hotel ? pickBestFitRoom(hotel.roomCategories, guests) : undefined);
  const rate = selectedRoom
    ? { rate: selectedRoom.price, estimated: false }
    : hotel
      ? nightlyRateFor(hotel)
      : null;
  const totals = rate && nights > 0 ? bookingTotal(rate.rate, nights) : null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-6 px-4 py-12 sm:px-6">
      <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
        Step 2 of 2 — Confirmation
      </p>

      {confirm.isPending ? (
        <div className="flex flex-col items-center gap-4 py-10 text-center">
          <Loader2 className="size-10 animate-spin text-primary" />
          <div>
            <h1 className="font-display text-3xl font-semibold">Confirming your booking…</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Finalizing with the hotel — don&apos;t close this page.
            </p>
          </div>
        </div>
      ) : confirmed ? (
        <>
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="animate-confirm-pop flex size-20 items-center justify-center rounded-full bg-primary">
              <svg viewBox="0 0 24 24" className="size-10" fill="none" aria-hidden>
                <path
                  d="M4.5 12.5l5 5 10-11"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-confirm-draw text-primary-foreground"
                />
              </svg>
            </span>
            <div>
              <h1 className="font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                You&apos;re going.
              </h1>
              <p className="mt-2 text-muted-foreground">
                {bookingId ? (
                  <>Booking <span className="font-semibold text-foreground">#{bookingId}</span> is confirmed.</>
                ) : (
                  <>Your booking is confirmed.</>
                )}{" "}
                A receipt is on its way to your inbox.
              </p>
            </div>
          </div>

          {hotel && checkin && checkout && rate && totals && (
            <div className="w-full">
              <BookingSummary
                hotel={hotel}
                nightlyRate={rate.rate}
                rateEstimated={rate.estimated}
                roomLabel={selectedRoom ? roomLabel(selectedRoom.roomType) : undefined}
                checkin={checkin}
                checkout={checkout}
                guests={guests}
              />
            </div>
          )}

          <Button size="lg" nativeButton={false} render={<Link href="/" />}>
            Find another stay <ArrowRight className="size-4" />
          </Button>
        </>
      ) : (
        <div className="flex w-full flex-col items-center gap-4 rounded-2xl border border-destructive/30 bg-card px-6 py-14 text-center">
          <h1 className="font-display text-3xl font-semibold">Confirmation didn&apos;t go through</h1>
          <p className="max-w-md text-sm text-muted-foreground">
            {friendlyMessage(confirm.error)} Your room hold from step 1 may
            still be active — retrying is safe and can never double-book.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={() => confirm.mutate()}>
              <RotateCcw className="size-4" /> Retry confirmation
            </Button>
            <Button variant="outline" nativeButton={false} render={<Link href="/" />}>
              Back to stays
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
