"use client";

import * as React from "react";
import { BedDouble, Check, Users } from "lucide-react";
import { cn } from "cn";
import { roomLabel, formatINR } from "@/lib/format";
import type { RoomCategory } from "@/lib/api/types";

// Room-type selector on the hotel page (Booking.com-style): one card per
// room type, best-fit first, real per-night price, occupancy shown plainly.

export function RoomTypePicker({
  categories,
  selectedId,
  onSelect,
}: {
  categories: RoomCategory[];
  selectedId: number | undefined;
  onSelect: (id: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {categories.map((category) => {
        const selected = category.id === selectedId;
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
            aria-pressed={selected}
            className={cn(
              "flex items-center justify-between gap-3 rounded-2xl border bg-card p-4 text-left transition-colors",
              selected
                ? "border-primary ring-1 ring-primary"
                : "border-border hover:border-primary/40 hover:bg-muted/40",
            )}
          >
            <div className="flex min-w-0 items-start gap-3">
              <span
                className={cn(
                  "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border",
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground",
                )}
              >
                {selected ? <Check className="size-4" /> : <BedDouble className="size-4" />}
              </span>
              <div className="min-w-0">
                <p className="font-display text-lg leading-snug font-semibold">
                  {roomLabel(category.roomType)}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="size-3.5" /> Sleeps {category.occupancy}
                  </span>
                  <span className="flex items-center gap-1">
                    <BedDouble className="size-3.5" /> {category.roomCount} room
                    {category.roomCount === 1 ? "" : "s"} left
                  </span>
                </p>
              </div>
            </div>
            <p className="shrink-0 text-right">
              <span className="block text-lg font-semibold text-primary">
                {formatINR(category.price)}
              </span>
              <span className="text-xs text-muted-foreground">/ night</span>
            </p>
          </button>
        );
      })}
    </div>
  );
}