"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, LogOut } from "lucide-react";
import { AccountCard } from "@/components/profile/account-card";
import { PasswordCard } from "@/components/profile/password-card";
import { BookingsCard } from "@/components/profile/bookings-card";
import { FavoritesCard } from "@/components/profile/favorites-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RequireAuth, useIsAdmin, useSession } from "@/lib/auth/session";

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  );
}

function ProfileContent() {
  const { user, signOut, setUser } = useSession();
  const isAdmin = useIsAdmin();
  const router = useRouter();
  if (!user) return null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4">
        <span className="flex size-16 items-center justify-center rounded-full bg-primary font-display text-3xl font-semibold text-primary-foreground">
          {user.username.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl font-semibold tracking-tight">{user.username}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {user.roles.map((role) => (
              <Badge key={role} variant="outline">
                {role}
              </Badge>
            ))}
            {user.createdAt && (
              <span className="text-xs text-muted-foreground">
                Member since {new Date(user.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button variant="outline" nativeButton={false} render={<Link href="/admin" />}>
              <Building2 className="size-4" /> Manage stays
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => {
              signOut();
              router.push("/");
            }}
          >
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AccountCard user={user} onUpdated={setUser} />
        <PasswordCard />
      </div>

      <BookingsCard userId={user.id} />
      <FavoritesCard />
    </div>
  );
}