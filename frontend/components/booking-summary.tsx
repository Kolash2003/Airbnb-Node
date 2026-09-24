import { BedDouble, CalendarDays, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  bookingTotal,
  formatDateLabel,
  formatINR,
  nightsBetween,
} from "@/lib/format";
import type { Hotel } from "@/lib/api/types";

// Persistent summary that survives the whole flow (DESIGN.md §8.6): dates,
// room, running price — visible on every booking step so no one loses context.

export function BookingSummary({
  hotel,
  nightlyRate,
  rateEstimated,
  checkin,
  checkout,
  guests,
}: {
  hotel: Hotel;
  nightlyRate: number;
  rateEstimated: boolean;
  checkin: string;
  checkout: string;
  guests: number;
}) {
  const nights = nightsBetween(checkin, checkout);
  const { subtotal, fee, total } = bookingTotal(nightlyRate, nights);

  return (
    <aside className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-24">
      <div>
        <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
          Your stay
        </p>
        <h3 className="font-display mt-1 text-2xl leading-tight font-semibold">{hotel.name}</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {hotel.address} · {hotel.location}
        </p>
      </div>

      <Separator />

      <dl className="flex flex-col gap-2.5 text-sm">
        <div className="flex items-center gap-2.5">
          <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
          <div className="flex flex-1 items-center justify-between gap-2">
            <dt className="text-muted-foreground">Check-in</dt>
            <dd className="font-medium">{formatDateLabel(checkin)}</dd>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
          <div className="flex flex-1 items-center justify-between gap-2">
            <dt className="text-muted-foreground">Check-out</dt>
            <dd className="font-medium">{formatDateLabel(checkout)}</dd>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Users className="size-4 shrink-0 text-muted-foreground" />
          <div className="flex flex-1 items-center justify-between gap-2">
            <dt className="text-muted-foreground">Guests</dt>
            <dd className="font-medium">
              {guests} guest{guests === 1 ? "" : "s"} · {nights} night{nights === 1 ? "" : "s"}
            </dd>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <BedDouble className="size-4 shrink-0 text-muted-foreground" />
          <div className="flex flex-1 items-center justify-between gap-2">
            <dt className="text-muted-foreground">Rate</dt>
            <dd className="font-medium">
              {formatINR(nightlyRate)} / night{rateEstimated ? " (est.)" : ""}
            </dd>
          </div>
        </div>
      </dl>

      <Separator />

      {/* Price transparency: the real total before checkout starts (§8.5). */}
      <dl className="flex flex-col gap-1.5 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">
            {formatINR(nightlyRate)} × {nights} night{nights === 1 ? "" : "s"}
          </dt>
          <dd>{formatINR(subtotal)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Service fee (12%)</dt>
          <dd>{formatINR(fee)}</dd>
        </div>
        <div className="flex items-center justify-between pt-1 text-base font-semibold">
          <dt>Total</dt>
          <dd className="text-primary">{formatINR(total)}</dd>
        </div>
      </dl>
    </aside>
  );
}
