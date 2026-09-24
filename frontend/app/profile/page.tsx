"use client";

import { useRouter } from "next/navigation";
import { LogOut, Mail, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RequireAuth, useSession } from "@/lib/auth/session";

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  );
}

function ProfileContent() {
  const { user, signOut } = useSession();
  const router = useRouter();
  if (!user) return null;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      <div className="flex items-center gap-4">
        <span className="flex size-16 items-center justify-center rounded-full bg-primary font-display text-3xl font-semibold text-primary-foreground">
          {user.username.charAt(0).toUpperCase()}
        </span>
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">{user.username}</h1>
          <p className="text-sm text-muted-foreground">Member #{user.id}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <UserRound className="size-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Username</p>
            <p className="text-sm font-medium">{user.username}</p>
          </div>
        </div>
        <Separator />
        <div className="flex items-center gap-3">
          <Mail className="size-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-sm font-medium">{user.email}</p>
          </div>
        </div>
        {user.createdAt && (
          <>
            <Separator />
            <p className="text-xs text-muted-foreground">
              Joined {new Date(user.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
            </p>
          </>
        )}
      </div>

      <Button
        variant="outline"
        className="w-fit"
        onClick={() => {
          signOut();
          router.push("/");
        }}
      >
        <LogOut className="size-4" /> Sign out
      </Button>
    </div>
  );
}
