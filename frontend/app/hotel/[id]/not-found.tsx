import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HotelNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-4 px-4 py-20 text-center sm:px-6">
      <h1 className="font-display text-4xl font-semibold tracking-tight">This stay isn&apos;t here</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        It may have been removed by the host. Similar stays are one search away.
      </p>
      <Button nativeButton={false} render={<Link href="/" />}>
        Browse all stays
      </Button>
    </div>
  );
}
