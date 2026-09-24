import { cn } from "cn";

// Consistent "photography" treatment (DESIGN.md §8.7): the API has no images,
// so every listing gets a deterministic duotone placeholder — one 4:3 crop,
// one corner treatment, one hover behavior, applied everywhere.

const PALETTES = [
  "from-emerald-950 via-emerald-900 to-teal-800",
  "from-stone-700 via-emerald-900 to-teal-800",
  "from-teal-950 via-emerald-950 to-stone-800",
  "from-[#1c2b26] via-[#2a4239] to-[#3d5a4c]",
  "from-stone-900 via-[#24352e] to-teal-900",
  "from-[#22332c] via-stone-800 to-[#31473b]",
] as const;

export function HotelImage({
  hotelId,
  name,
  location,
  className,
}: {
  hotelId: number;
  name: string;
  location: string;
  className?: string;
}) {
  const palette = PALETTES[Math.abs(hotelId) % PALETTES.length];
  const initial = (name.trim().charAt(0) || "H").toUpperCase();

  return (
    <div
      className={cn(
        "relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gradient-to-br",
        palette,
        className,
      )}
      role="img"
      aria-label={`Photo placeholder for ${name}`}
    >
      {/* soft light wash + grain-ish vignette keep every card in one family */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_20%_10%,rgba(255,255,255,0.22),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(100%_100%_at_50%_100%,rgba(0,0,0,0.35),transparent_60%)]" />
      <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-out group-hover:scale-[1.04]">
        <span className="font-display text-7xl font-semibold text-white/90 select-none">
          {initial}
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
        <span className="truncate text-[11px] font-medium tracking-[0.14em] text-white/80 uppercase">
          {location}
        </span>
      </div>
    </div>
  );
}
