// Minimal global client state: the auth session (DESIGN.md §4.6). Server data
// stays in the React Query cache; only { token, user } lives here.

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { TOKEN_KEY } from "@/lib/api/client";
import { fetchProfile } from "@/lib/api/auth";
import type { User } from "@/lib/api/types";

interface Session {
  user: User | null;
  token: string | null;
  /** False until the stored token has been validated on mount. */
  ready: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => void;
  refresh: () => Promise<void>;
}

const SessionContext = React.createContext<Session | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [token, setToken] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<User | null>(null);
  const [ready, setReady] = React.useState(false);

  const loadProfile = React.useCallback(async () => {
    // Fetched once per sign-in and cached here — never per render — because
    // AuthinGo rate-limits to 5 req/min (backend gap §7.8).
    const profile = await fetchProfile();
    setUser(profile);
  }, []);

  const signOut = React.useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const signIn = React.useCallback(
    async (nextToken: string) => {
      window.localStorage.setItem(TOKEN_KEY, nextToken);
      setToken(nextToken);
      await loadProfile();
    },
    [loadProfile],
  );

  const refresh = React.useCallback(async () => {
    await loadProfile();
  }, [loadProfile]);

  // Restore the session once on mount. All state updates happen inside the
  // async continuation (never synchronously in the effect body), and the
  // profile is fetched exactly once — AuthinGo allows 5 req/min.
  React.useEffect(() => {
    let cancelled = false;
    const restore = async () => {
      const stored = window.localStorage.getItem(TOKEN_KEY);
      if (!stored) return;
      setToken(stored);
      try {
        const profile = await fetchProfile();
        if (!cancelled) setUser(profile);
      } catch {
        // Stale/expired token (24h, no refresh): drop it silently.
        window.localStorage.removeItem(TOKEN_KEY);
        if (!cancelled) {
          setToken(null);
          setUser(null);
        }
      }
    };
    restore().finally(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // No refresh token exists, so a 401 means "log in again" (§4.3).
  React.useEffect(() => {
    const onUnauthorized = () => {
      signOut();
      router.push("/login");
    };
    window.addEventListener("haven:unauthorized", onUnauthorized);
    return () => window.removeEventListener("haven:unauthorized", onUnauthorized);
  }, [signOut, router]);

  const value = React.useMemo(
    () => ({ user, token, ready, signIn, signOut, refresh }),
    [user, token, ready, signIn, signOut, refresh],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): Session {
  const ctx = React.useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within AuthProvider");
  return ctx;
}

/** Client-side route guard. Real RBAC needs backend role claims (gap §7.4);
 *  until then this gates on "signed in". */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, ready } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  if (!ready || !user) return null;
  return <>{children}</>;
}
