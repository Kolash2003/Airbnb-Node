import Link from "next/link";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="space-y-1.5 text-center">
          <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {children}
        <p className="text-center text-sm text-muted-foreground">{footer}</p>
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Protected by Haven — sessions last 24 hours, then you sign in again.
      </p>
    </div>
  );
}

export function AuthSwap({ href, label, text }: { href: string; label: string; text: string }) {
  return (
    <>
      {text}{" "}
      <Link href={href} className="font-medium text-primary hover:underline">
        {label}
      </Link>
    </>
  );
}
