"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GuestStepper({
  guests,
  onChange,
  min = 1,
  max = 16,
}: {
  guests: number;
  onChange: (guests: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        disabled={guests <= min}
        onClick={() => onChange(Math.max(min, guests - 1))}
        aria-label="Fewer guests"
      >
        <Minus className="size-3.5" />
      </Button>
      <span className="w-4 text-center text-sm font-medium" aria-live="polite">
        {guests}
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        disabled={guests >= max}
        onClick={() => onChange(Math.min(max, guests + 1))}
        aria-label="More guests"
      >
        <Plus className="size-3.5" />
      </Button>
    </div>
  );
}
