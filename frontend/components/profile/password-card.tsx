"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePassword } from "@/lib/api/auth";
import { friendlyMessage } from "@/lib/api/client";

export function PasswordCard() {
  const [current, setCurrent] = React.useState("");
  const [next, setNext] = React.useState("");
  const [confirm, setConfirm] = React.useState("");

  const change = useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      changePassword({ currentPassword, newPassword }),
    onSuccess: () => {
      toast.success("Password updated.");
      setCurrent("");
      setNext("");
      setConfirm("");
    },
    onError: (err) => toast.error(friendlyMessage(err)),
  });

  const mismatch = confirm !== "" && confirm !== next;

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
      <div>
        <h2 className="font-display flex items-center gap-2 text-xl font-semibold">
          <Lock className="size-4 text-muted-foreground" /> Change password
        </h2>
        <p className="text-sm text-muted-foreground">Sessions stay valid — sign in again next time.</p>
      </div>

      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (mismatch) return;
          change.mutate({ currentPassword: current, newPassword: next });
        }}
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="current-password">Current password</Label>
          <Input
            id="current-password"
            type="password"
            autoComplete="current-password"
            required
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            placeholder="Minimum 8 characters"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirm-password">Confirm new password</Label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            aria-invalid={mismatch}
          />
          {mismatch && <p className="text-xs text-destructive">Passwords don&apos;t match.</p>}
        </div>
        <Button type="submit" disabled={change.isPending || mismatch || next.length < 8}>
          {change.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Updating…
            </>
          ) : (
            "Update password"
          )}
        </Button>
      </form>
    </section>
  );
}