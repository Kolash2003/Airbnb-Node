"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, LogOut, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, useIsAdmin } from "@/lib/auth/session";

export function SiteHeader() {
  const { user, ready, signOut } = useSession();
  const isAdmin = useIsAdmin();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-baseline gap-1.5">
          <span className="font-display text-[26px] leading-none font-semibold tracking-tight">
            Haven
          </span>
          <span className="hidden text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase sm:inline">
            Stays
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/" />}>
            Stays
          </Button>
          {isAdmin && (
            <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/admin" />}>
              Manage
            </Button>
          )}

          {!ready ? null : user ? (
            <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="outline" size="sm" className="ml-1 gap-2" />}
            >
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                  <span className="max-w-24 truncate">{user.username}</span>
            </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <UserRound className="size-4" /> Profile
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => router.push("/admin")}>
                    <Building2 className="size-4" /> Manage stays
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    signOut();
                    router.push("/");
                  }}
                >
                  <LogOut className="size-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/login" />}>
                Sign in
              </Button>
              <Button size="sm" nativeButton={false} render={<Link href="/signup" />}>
                Join
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
