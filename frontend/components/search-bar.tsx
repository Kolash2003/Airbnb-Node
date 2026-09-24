"use client";

import * as React from "react";
import { MapPin, Search, Users } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateRangePicker } from "./date-range-picker";
import { GuestStepper } from "./guest-stepper";

export interface SearchValues {
  destination: string;
  range: DateRange | undefined;
  guests: number;
}

// The search bar is the real homepage (DESIGN.md §8.3): destination, dates,
// guests — persistent, minimal, nothing competing with it above the fold.

export function SearchBar({
  initial,
  onSearch,
}: {
  initial: SearchValues;
  onSearch: (values: SearchValues) => void;
}) {
  const [destination, setDestination] = React.useState(initial.destination);
  const [range, setRange] = React.useState<DateRange | undefined>(initial.range);
  const [guests, setGuests] = React.useState(initial.guests);
  const [guestsOpen, setGuestsOpen] = React.useState(false);

  // Stay in sync when the URL changes underneath us (back/forward
  // navigation). This is the sanctioned "adjust state during render" pattern:
  // it preserves focus, unlike remounting on a key.
  const [synced, setSynced] = React.useState(initial);
  if (
    synced.destination !== initial.destination ||
    synced.guests !== initial.guests ||
    synced.range?.from?.getTime() !== initial.range?.from?.getTime() ||
    synced.range?.to?.getTime() !== initial.range?.to?.getTime()
  ) {
    setSynced(initial);
    setDestination(initial.destination);
    setRange(initial.range);
    setGuests(initial.guests);
  }

  return (
    <form
      className="grid w-full grid-cols-1 gap-2 rounded-2xl border border-border bg-card p-2 shadow-lg shadow-black/5 sm:grid-cols-[1.2fr_1.4fr_1fr_auto] sm:rounded-full sm:py-2 sm:pr-2 sm:pl-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch({ destination, range, guests });
      }}
    >
      <label className="flex h-12 items-center gap-2 rounded-xl px-3.5 transition-colors focus-within:bg-muted/60 hover:bg-muted/60 sm:rounded-full">
        <MapPin className="size-4 shrink-0 text-muted-foreground" />
        <span className="sr-only">Destination</span>
        <Input
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Where to? City, area, stay…"
          className="h-full border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
        />
      </label>

      <div className="border-t border-border sm:border-t-0 sm:border-l">
        <DateRangePicker
          range={range}
          onChange={setRange}
          className="border-0 shadow-none hover:bg-muted/60 focus-visible:ring-0"
        />
      </div>

      <Popover open={guestsOpen} onOpenChange={setGuestsOpen}>
        <PopoverTrigger
          type="button"
          render={
          <Button
            type="button"
            variant="outline"
            className="h-12 justify-start gap-2 rounded-xl border-0 px-3.5 font-normal shadow-none hover:bg-muted/60 sm:rounded-full"
          />
        }
      >
        <Users className="size-4 shrink-0 text-muted-foreground" />
        <span className="text-sm">
          {guests} guest{guests === 1 ? "" : "s"}
        </span>
      </PopoverTrigger>
        <PopoverContent align="center" className="w-64">
          <div className="flex items-center justify-between gap-2 p-1">
            <div>
              <p className="text-sm font-medium">Guests</p>
              <p className="text-xs text-muted-foreground">Ages 13+</p>
            </div>
            <div className="flex items-center gap-3">
              <GuestStepper guests={guests} onChange={setGuests} />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Button type="submit" size="lg" className="h-12 rounded-xl px-6 sm:rounded-full">
        <Search className="size-4" />
        Search
      </Button>
    </form>
  );
}
