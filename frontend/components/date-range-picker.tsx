"use client";

import * as React from "react";
import { CalendarDays } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "cn";

// Date-range picker done right (DESIGN.md §8.3): clear check-in/check-out
// states, past dates disabled, and a visible length-of-stay count.

export function DateRangePicker({
  range,
  onChange,
  className,
}: {
  range: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);

  const nights =
    range?.from && range?.to
      ? Math.max(
          0,
          Math.round((range.to.getTime() - range.from.getTime()) / 86_400_000),
        )
      : 0;

  const label =
    range?.from && range?.to
      ? `${format(range.from, "d MMM")} → ${format(range.to, "d MMM")} · ${nights} night${nights === 1 ? "" : "s"}`
      : range?.from
        ? `${format(range.from, "d MMM")} → pick check-out`
        : "Add dates";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        render={
          <Button
            variant="outline"
            className={cn(
              "h-12 w-full justify-start gap-2 rounded-xl bg-background px-3.5 text-left font-normal",
              !range?.from && "text-muted-foreground",
              className,
            )}
          />
        }
      >
        <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
        <span className="truncate text-sm">{label}</span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="range"
          numberOfMonths={2}
          selected={range}
          onSelect={onChange}
          disabled={{ before: new Date() }}
          defaultMonth={range?.from}
        />
        <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
          <p className="text-xs text-muted-foreground">
            {nights > 0 ? `${nights} night${nights === 1 ? "" : "s"} selected` : "Select check-in, then check-out"}
          </p>
          <Button size="sm" disabled={nights === 0} onClick={() => setOpen(false)}>
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
