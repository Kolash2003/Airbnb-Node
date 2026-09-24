import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

// Empty and error states that point somewhere (DESIGN.md §8.9): never a
// dead end — always a next step (nearby dates, all stays, contact).

export function EmptyState({
  title,
  body,
  actionHref = "/",
  actionLabel = "Browse all stays",
}: {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <SearchX className="size-5" />
      </span>
      <div className="max-w-sm space-y-1.5">
        <h3 className="font-display text-2xl font-semibold">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
      <Button variant="outline" nativeButton={false} render={<Link href={actionHref} />}>
        {actionLabel}
      </Button>
    </div>
  );
}
