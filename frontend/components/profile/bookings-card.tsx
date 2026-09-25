"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Users } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { listBookings } from "@/lib/api/booking";
import { listHotels } from "@/lib/api/hotel";
import { friendlyMessage } from "@/lib/api/client";
import { formatDateLabel, formatINR } from "@/lib/format";
import type { BookingStatus, Hotel } from "@/lib/api/types";

const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
};

function statusVariant(status: BookingStatus): "secondary" | "destructive" | "outline" {
  switch (status) {
    case "CONFIRMED":
      return "secondary";
    case "CANCELLED":
      return "destructive";
    default:
      return "outline";
  }
}

export function BookingsCard({ userId }: { userId: number }) {
  const { data: bookingData, isPending, isError, error } = useQuery({
    queryKey: ["bookings", userId],
    queryFn: () => listBookings(userId),
  });
  const { data: hotels } = useQuery({ queryKey: ["hotels"], queryFn: () => listHotels() });

  const hotelById = React.useMemo(() => {
    const map = new Map<number, Hotel>();
    for (const h of hotels ?? []) map.set(h.id, h);
    return map;
  }, [hotels]);

  const bookings = bookingData?.bookings ?? [];

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
      <div>
        <h2 className="font-display text-xl font-semibold">Booking history</h2>
        <p className="text-sm text-muted-foreground">Your stays across Haven.</p>
      </div>

      {isPending ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-sm text-muted-foreground">{friendlyMessage(error)}</p>
      ) : bookings.length === 0 ? (
        <EmptyState
          title="No bookings yet"
          body="When you book a stay, it shows up here with its status and total."
          actionHref="/"
          actionLabel="Browse stays"
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {bookings.map((booking) => {
            const hotel = hotelById.get(booking.hotelId);
            return (
              <li
                key={booking.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background/60 p-4"
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <CalendarDays className="size-3.5 shrink-0 text-muted-foreground" />
                    {formatDateLabel(booking.createdAt)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Booking #{booking.id}
                    {hotel ? (
                      <>
                        {" · "}
                        <Link
                          href={`/hotel/${hotel.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {hotel.name}
                        </Link>
                      </>
                    ) : (
                      " · Stay"
                    )}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="size-3.5" /> {booking.totalGuests} guest
                    {booking.totalGuests === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">{formatINR(booking.bookingAmount)}</span>
                  <Badge variant={statusVariant(booking.status)}>
                    {STATUS_LABELS[booking.status]}
                  </Badge>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}