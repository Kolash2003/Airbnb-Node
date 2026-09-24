import type { NextConfig } from "next";

// Service origins. DESIGN.md §4.12: never hardcode ports — each service gets
// its own base URL because Auth and Booking both default to :3001.
// These are server-side only (rewrites run on the server), so no NEXT_PUBLIC_
// prefix is needed; the browser only ever talks to same-origin /api/*.
const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL ?? "http://localhost:3001";
const HOTEL_SERVICE_URL =
  process.env.HOTEL_SERVICE_URL ?? "http://localhost:3000";
const BOOKING_SERVICE_URL =
  process.env.BOOKING_SERVICE_URL ?? "http://localhost:3002";

const nextConfig: NextConfig = {
  // Single-origin BFF proxy (DESIGN.md §4.1). One origin => no CORS issues in
  // the browser, one place to normalize the three response envelopes.
  // AuthinGo has no /api prefix; the Node services live under /api/v1.
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${AUTH_SERVICE_URL}/:path*`,
      },
      {
        source: "/api/hotel/:path*",
        destination: `${HOTEL_SERVICE_URL}/api/v1/:path*`,
      },
      {
        source: "/api/booking/:path*",
        destination: `${BOOKING_SERVICE_URL}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
