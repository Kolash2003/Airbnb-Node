// Normalized API client (DESIGN.md §4.2).
//
// The three services speak three different envelopes and the Node services
// return 201 even for GETs, so success is detected from the envelope shape —
// never from res.status. Every call resolves to the unwrapped payload or
// throws a typed ApiError.

export type Service = "auth" | "hotel" | "booking";

const BASE: Record<Service, string> = {
  auth: "/api/auth",
  hotel: "/api/hotel",
  booking: "/api/booking",
};

export const TOKEN_KEY = "haven.auth.token";

export class ApiError extends Error {
  readonly status: number;
  readonly service: Service;
  readonly code: "unauthorized" | "forbidden" | "not-found" | "conflict" | "validation" | "rate-limited" | "server" | "network";

  constructor(message: string, opts: { status: number; service: Service }) {
    super(message);
    this.name = "ApiError";
    this.status = opts.status;
    this.service = opts.service;
    this.code =
      opts.status === 401 ? "unauthorized"
      : opts.status === 403 ? "forbidden"
      : opts.status === 404 ? "not-found"
      : opts.status === 409 ? "conflict"
      : opts.status === 422 || opts.status === 400 ? "validation"
      : opts.status === 429 ? "rate-limited"
      : opts.status === 0 ? "network"
      : "server";
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

/** Collapse the various backend error shapes into one readable message. */
function firstMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object") {
    const p = payload as Record<string, unknown>;
    if (typeof p.message === "string" && p.message) return p.message;
    // Raw Zod error object from the Hotel service.
    if (p.error && typeof p.error === "object") {
      const issues = (p.error as { issues?: Array<{ message?: string }> }).issues;
      if (Array.isArray(issues) && issues[0]?.message) return issues[0].message;
      const errs = (p.error as { errors?: Array<{ message?: string }> }).errors;
      if (Array.isArray(errs) && errs[0]?.message) return errs[0].message;
    }
    // Auth service puts err.Error() string in `data` on failure.
    if (typeof p.data === "string" && p.data) return p.data;
  }
  return fallback;
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Attach the stored JWT. Defaults to true; auth endpoints pass false. */
  auth?: boolean;
}

export async function request<T>(
  service: Service,
  path: string,
  { body, auth = true, headers, ...init }: RequestOptions = {},
): Promise<T> {
  const url = `${BASE[service]}${path}`;
  const token = auth ? getToken() : null;

  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : null),
        ...(token ? { Authorization: `Bearer ${token}` } : null),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Could not reach the server. Is it running?", {
      status: 0,
      service,
    });
  }

  let payload: unknown = null;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  // --- Envelope normalization -------------------------------------------
  // Auth: { status: "success" | "error", message, data }
  if (service === "auth" && payload && typeof payload === "object" && "status" in payload) {
    const p = payload as { status: string; message?: string; data?: unknown };
    if (p.status !== "success") {
      throw new ApiError(firstMessage(payload, `Request failed (${res.status})`), {
        status: res.status,
        service,
      });
    }
    if (res.status === 401) notifyUnauthorized();
    return p.data as T;
  }

  // Hotel success: { message, data, success: true }
  // Hotel/Booking error: { success: false, message }
  if (payload && typeof payload === "object" && "success" in payload) {
    const p = payload as { success: boolean };
    if (p.success === false) {
      if (res.status === 401) notifyUnauthorized();
      throw new ApiError(firstMessage(payload, `Request failed (${res.status})`), {
        status: res.status || 500,
        service,
      });
    }
    return (payload as { success: true; data: T }).data;
  }

  // Booking create/confirm return raw { bookingId, ... } with no envelope.
  if (!res.ok) {
    if (res.status === 401) notifyUnauthorized();
    throw new ApiError(firstMessage(payload, `Request failed (${res.status})`), {
      status: res.status,
      service,
    });
  }
  return payload as T;
}

/** Broadcast so the auth session can react to 401s (no refresh token exists,
 *  so expiry means redirect to /login — DESIGN.md §4.3). */
function notifyUnauthorized() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("haven:unauthorized"));
  }
}

/** Friendly one-liner for toasts, mapped from backend AppError semantics. */
export function friendlyMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.code === "network") return err.message;
    if (err.code === "rate-limited") return "Too many tries — please wait a minute and try again.";
    return err.message;
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
}
