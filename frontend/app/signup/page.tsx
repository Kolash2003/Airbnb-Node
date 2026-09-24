"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AuthCard, AuthSwap } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, signup } from "@/lib/api/auth";
import { friendlyMessage } from "@/lib/api/client";
import { useSession } from "@/lib/auth/session";

export default function SignupPage() {
  const router = useRouter();
  const { signIn, user, ready } = useSession();
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    if (ready && user) router.replace("/");
  }, [ready, user, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      await signup({ username: username.trim(), email: email.trim(), password });
      // Signup returns no token, so sign straight in with the same credentials.
      try {
        const token = await login({ email: email.trim(), password });
        await signIn(token);
        toast.success(`Welcome to Haven, ${username.trim()}.`);
        router.push("/");
      } catch {
        toast.success("Account created — sign in to continue.");
        router.push("/login");
      }
    } catch (err) {
      toast.error(friendlyMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthCard
      title="Join Haven"
      subtitle="One account for booking stays anywhere."
      footer={<AuthSwap href="/login" label="Sign in" text="Already have an account?" />}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            autoComplete="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="wanderer_42"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 8 characters"
          />
        </div>
        <Button type="submit" size="lg" disabled={pending} className="h-11">
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Creating account…
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </AuthCard>
  );
}
