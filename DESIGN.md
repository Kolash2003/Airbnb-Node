# Frontend Design Document — Airbnb Clone (Hotel Booking Platform)

> Scope: design decisions required to build the frontend on top of the existing
> backend microservices. Primary focus is the **Hotelservice**, with the
> Auth, Booking, and Notification services considered as collaborators.

---

## 1. System Context

Four backend microservices exist today:

| Service | Language / Stack | Data store | Queue / extras | Default port |
|---|---|---|---|---|
| **AuthinGo** | Go, go-chi, JWT + bcrypt | MySQL (`database/sql`) | rate limiter, RBAC | `:3001` |
| **Hotelservice** | Node + Express 5 + TS, Sequelize | MySQL | BullMQ + Redis (room generation) | `3000` |
| **Bookingservice** | Node + Express 5 + TS, Prisma | MySQL | BullMQ + Redis, Redlock | `3001` |
| **Notificationservice** | Node + Express 5 + TS | — | BullMQ + Redis, Nodemailer | `3001` |

The frontend must talk to **multiple base URLs** (at least Auth and Hotel,
plus Booking), and these URLs are **not versioned consistently**
(Auth has no `/api` prefix; the Node services use `/api/v1`).

```
Frontend ──► AuthinGo        (:3001)   /signup /login /profile /roles...
       └───► Hotelservice    (:3000)   /api/v1/hotels /api/v1/room-generation
       └───► Bookingservice  (:3001)   /api/v1/bookings
       └───► (Notificationservice is internal — never called by the browser)
```

> **Note:** Auth, Booking and Notification all default to port `3001`, so in any
> real deployment they must be assigned distinct ports / hostnames. The frontend
> config must treat each as a separate base URL rather than assuming one origin.

---

## 2. Backend API Contract (what the frontend actually gets)

### 2.1 Hotelservice (`/api/v1`)

| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/hotels` | `{ name, address, location, rating?, ratingCount? }` | `201` `{ message, data: Hotel, success: true }` |
| GET | `/hotels` | — | `201` `{ message, data: Hotel[], success: true }` |
| GET | `/hotels/:id` | — | `201` `{ message, data: Hotel, success: true }` |
| DELETE | `/hotels/:id` | — | `201` `{ message, data, success: true }` |
| POST | `/room-generation` | `{ roomCategoryId, startDate, endDate, priceOverride?, batchSize? }` | `201` `{ message, data: {}, success: true }` |
| GET | `/ping` / `/ping/health` | — | `OK` |

**Hotel model fields:** `id, name, address, location, rating (int), ratingCount (int), price (int), createdAt, updatedAt, deletedAt`.
**RoomCategory:** `id, hotelId, price, roomType (SINGLE|DOUBLE|FAMILY|DELUXE|SUITE), roomCount, ...`.
**Room:** `id, hotelId, roomCategoryId, dateofAvailability, price, bookingId?, ...`.

### 2.2 Bookingservice (`/api/v1`)

| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/bookings` | `{ userId, hotelId, totalGuests, bookingAmount }` | `201` `{ bookingId, idempotencyKey }` |
| POST | `/bookings/confirm/:idempotencyKey` | — | `201` `{ bookingId, status }` |

Booking status enum: `PENDING → CONFIRMED / CANCELLED`.
**Two-step flow:** create returns an **idempotency key** that must be persisted
and later used to confirm. The frontend owns carrying this key between steps.

### 2.3 AuthinGo (no `/api` prefix)

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/signup` | — | `{ username, email, password }` | `{ status, message, data }` |
| POST | `/login` | — | `{ email, password }` | `{ status, message, data: "<JWT>" }` |
| GET | `/profile` | JWT (`user`/`admin`) | — | `{ status, message, data: User }` |
| CRUD | `/roles...`, `/roles/{id}/permissions...` | — | varies | `{ status, message, data }` |
| POST | `/users/{userId}/roles/{roleId}` | JWT (`admin`) | — | `{ status, message, data }` |

**JWT:** HS256, 24h expiry, claims `{ id, email, exp }`. **No refresh token.**

### 2.4 Notificationservice

Queue-only from the browser's perspective. A "welcome" Handlebars template
(`{{Name}}`, `{{appName}}`) exists. The booking service enqueues emails via
BullMQ; no notification is user-initiated from the frontend.

---

## 3. Critical Gaps & Inconsistencies That Drive Decisions

These are backend realities the frontend **must** design around (or raise as
backend work):

1. **Three incompatible response envelopes:**
   - Hotel: `{ message, data, success: boolean }`
   - Booking: `{ bookingId, idempotencyKey }` / `{ bookingId, status }`
   - Auth: `{ status: "success"|"error", message, data }`
   ⇒ A single normalization layer is mandatory.

2. **Incorrect status codes:** Hotel endpoints return `201` even for `GET`
   and `DELETE`. The frontend must **not** rely on status codes for success
   detection; use the envelope shape instead.

3. **No room availability / search API.** The hotel service exposes hotels and
   room *generation*, but **no endpoint to list room categories, list rooms, or
   query availability by date**. A guest-facing "book a room" flow currently
   has no read path. This is the largest blocker for a booking UI and needs a
   decision: build the missing read endpoints, or mock until they exist.

4. **Room generation returns no job id.** `POST /room-generation` responds with
   `data: {}` — the frontend has no handle to poll job status (despite a
   `RoomGenerationResponse` type that *mentions* `jobId`). Async progress
   tracking is currently impossible without backend changes.

5. **No auth on Hotel/Booking endpoints.** Only AuthinGo enforces JWT/RBAC.
   Hotel and Booking APIs are effectively open. The frontend can still gate
   routes locally, but real security requires backend middleware.

6. **No CORS configured** on any service. Either add `cors` middleware or proxy
   all traffic through one origin.

7. **`hotels.price` exists in DB (migration) but not in the Sequelize model**, and
   actual per-room pricing lives on `room_categories.price` / `rooms.price`.
   The pricing source of truth is ambiguous and must be clarified.

8. **Rate limiting (5 req/min) on AuthinGo** — the frontend should batch auth
   calls and not re-fetch `/profile` on every render.

9. **`GET /hotels` returns 404 when empty** (throws `NotFoundError`), so an empty
   list is indistinguishable from a real error.

---

## 4. Frontend Architecture Decisions

### 4.1 API Access Layer — BFF / Gateway / Proxy (DECISION)
**Recommendation:** A single **Vite dev proxy** in dev and a **reverse proxy
(nginx)/BFF** in prod that maps paths to services, hiding the port mess:

```
/api/auth/*     → http://auth:3001/*
/api/hotel/*    → http://hotel:3000/api/v1/*
/api/booking/*  → http://booking:3001/api/v1/*
```

- One origin ⇒ no CORS issues in the browser.
- One place to inject the `Authorization` header and normalize errors.
- Alternative (direct multi-origin calls) requires enabling CORS everywhere and
  is fragile given the port collisions.

### 4.2 Response Normalization (DECISION)
**Recommendation:** an `apiClient` wrapper that parses every service's envelope
into a single internal shape and throws typed errors on failure. Success
detection must key off the **envelope** (not status code):

```ts
type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError };
```

Never trust `res.status` for the Node services (they return `201` for reads).

### 4.3 Authentication & Session Management (DECISION)
- **Store the JWT in `localStorage`/memory** (the backend only supports
  `Authorization: Bearer` and is not set up for httpOnly cookies; an
  httpOnly-cookie strategy would require backend changes).
- **Axios/fetch interceptor** attaches `Bearer <token>` to auth'd calls.
- **No refresh token exists** ⇒ handle 24h expiry by redirecting to login on
  `401` (or treat the token as valid until the auth service rejects it).
- Persist `{ id, email, roles }` client-side after login/profile fetch for RBAC.

### 4.4 Authorization / RBAC in the UI (DECISION)
- Roles known from the backend: `admin`, `user`, `moderator`.
- Implement **route guards + permission-aware components** (e.g., show
  "Assign role" and "Create hotel" only for `admin`).
- Distinguish `user` vs `admin` dashboards. Note `/profile` needs `user` or
  `admin`; role-assignment is `admin` only.

### 4.5 Data Fetching & Server State (DECISION)
**Recommendation:** **TanStack Query (React Query)** or **SWR**:
- Hotel list/详情 are read-heavy and cacheable.
- Handles retries, dedupe, and — critically — the async booking/room-generation
  flows (see §4.9) via polling and cache invalidation.

### 4.6 Client State (DECISION)
Keep global state minimal (auth session, theme). Use **Zustand/Context** for
auth; server data stays in the query cache. Booking draft (hotel, dates, guests)
can live in a small store or URL params (shareable links).

### 4.7 Routing & Information Architecture (DECISION)
Proposed route map (Next.js App Router or React Router):

```
/                    → hotel listing (search/filter)
/hotel/[id]          → hotel detail + room categories
/book                 → booking flow (dates → guests → review → confirm)
/book/confirm/[key]   → booking confirmation result
/login, /signup       → auth
/profile              → user profile (JWT)
/admin                → admin: hotels CRUD, room generation, roles
```

### 4.8 Design System / UI Library (DECISION)
**Recommendation:** Tailwind CSS + a headless component layer (shadcn/ui-style)
for the listing grid, date-range picker, cards, and forms. Decisions needed:
- Brand direction (Airbnb-like: large imagery, minimal chrome).
- Date-range picker component (rooms are date-availability-based).
- Empty/loading/error states for the async flows.

### 4.9 Async Operations Handling (DECISION)
Two asynchronous flows require explicit UX:

**Booking (two-step, idempotent):**
1. `POST /bookings` → persist `idempotencyKey` (sessionStorage or URL).
2. `POST /bookings/confirm/:key` → show result.
3. Handle duplicate create/confirm safely (idempotency exists precisely for
   double-submit protection — disable the button, never fire twice).

**Room generation (fire-and-forget, no job id):**
- Since `data` is empty, the UI can only show "job queued". If progress is
  required, the backend must return a `jobId` and expose a status endpoint
  (polling) or SSE. **Flag this as required backend work.**

### 4.10 Error Handling & Feedback (DECISION)
- Map backend `AppError` types (`400/401/403/404/409/500`) to user-friendly
  toasts/messages.
- Validation errors come back as a raw Zod object in Hotel service
  (`error: ZodError`) vs. Auth's `data: err.Error()` string — normalize both
  into a flat "first message" helper.
- Global error boundary + toast system (e.g., `sonner`).

### 4.11 Type Safety (DECISION)
- Generate TypeScript types from the backend contracts (hand-write from the DTOs
  or adopt OpenAPI/tRPC later). At minimum, centralize:
  `Hotel`, `RoomCategory`, `RoomType`, `Room`, `Booking`, `BookingStatus`,
  `User`, `Role`, `Permission`.
- `RoomType` enum is a closed set: `SINGLE | DOUBLE | FAMILY | DELUXE | SUITE`.

### 4.12 Environment & Config (DECISION)
One env-driven config for all base URLs:

```
VITE_API_AUTH_URL, VITE_API_HOTEL_URL, VITE_API_BOOKING_URL
```
Never hardcode ports; they collide across services.

### 4.13 Testing Strategy (DECISION)
- Unit: API normalization layer, RBAC guards, form validation.
- Integration: **Mock Service Worker (MSW)** to emulate the three differing
  envelopes and the two-step booking flow.
- E2E: Playwright for happy path (search → book → confirm) and auth flow.

---

## 5. Page → Data Dependency Map

| Page/Feature | Services called | Notes |
|---|---|---|
| Hotel list | Hotel `GET /hotels` | no pagination/filter today — client-side filter or backend work |
| Hotel detail | Hotel `GET /hotels/:id` | room categories **not exposed** — gap |
| Book flow | Booking `POST /bookings` + `POST /confirm` | persist idempotency key |
| Login/Signup | Auth `POST /login`, `/signup` | store JWT + role |
| Profile | Auth `GET /profile` | JWT required |
| Admin: hotel CRUD | Hotel `POST/DELETE /hotels` | needs auth middleware (gap) |
| Admin: room generation | Hotel `POST /room-generation` | async, no progress tracking (gap) |
| Admin: roles | Auth `/roles...` | RBAC |

---

## 6. Recommended Decision Log (Summary)

| # | Decision area | Recommendation |
|---|---|---|
| 1 | Access layer | Single proxy/BFF, one origin, no browser CORS |
| 2 | Response handling | Normalize all 3 envelopes; ignore status codes |
| 3 | Auth storage | JWT in localStorage/memory + Bearer interceptor |
| 4 | Session expiry | No refresh token → hard redirect to `/login` on 401 |
| 5 | Server state | TanStack Query / SWR |
| 6 | UI | Tailwind + shadcn-style headless components |
| 7 | Routing | React Router or Next.js App Router (map above) |
| 8 | Types | Hand-written shared types; centralize enums |
| 9 | Async booking | Two-step idempotency, single-fire submit |
| 10 | Async rooms | Requires backend `jobId` + status endpoint (open item) |
| 11 | Testing | MSW + Playwright |

---

## 7. Open Backend Items to Resolve (blocking or risky)

1. **Expose room categories & availability** (read paths) — required for booking.
2. **Return `jobId` from `/room-generation`** + a job-status endpoint — required
   for any progress UI.
3. **Standardize response envelope + status codes** across services.
4. **Add JWT/RBAC middleware to Hotel & Booking services** — security gap.
5. **Add CORS** (or rely on the proxy) if the frontend is served from a
   different origin than the APIs.
6. **Clarify hotel price vs room price** (`hotels.price` migration vs
   `room_categories.price` / `rooms.price`).
7. **Fix `GET /hotels` empty-list 404** so empty ≠ error.


## 8. Frontend Desions
Since this is a hospitality/travel product rather than a SaaS dashboard, I'd ground the choices there instead of defaulting to generic web-app patterns. Here's what I'd lock in:

1. Typography: Pair a confident serif (or humanist serif) for property names and hero moments with a plain, highly legible sans for UI and body text — search fields, filters, prices. That contrast reads "hotel," not "spreadsheet." Two families max, clearly distinct from each other.

2. Color: One deliberate accent, used sparingly — mainly on the primary CTA and price. Skip the default "warm cream + terracotta" or "near-black + neon" palettes that show up on nearly every generated site now. Pick something tied to actual positioning: muted, calmer tones read boutique/luxury; brighter, higher-contrast reads budget/volume.

3. The search bar is the real homepage: Destination, dates, guests — persistent, minimal fields, nothing competing with it above the fold. Get the date-range picker right specifically: clear check-in/check-out states, greyed-out unavailable dates, a visible length-of-stay count.

4. One card shape for every listing: Same aspect ratio, same layout — image, price, rating, 2–3 amenity icons, one CTA — across every property/room card. Don't let long hotel names or extra badges break the grid on some cards and not others.

5. Price transparency, not price-at-the-end: Decide once: per-night or total, tax-inclusive or not — and never change it mid-flow. Show the real total before checkout starts. Hidden fees are the single biggest trust-killer in travel booking, more than any visual polish.

6. A summary that survives the whole flow: Persistent sidebar or sticky footer through search → room select → checkout, recapping dates, room, and running price. Multi-step booking is exactly where people lose context and abandon.

7. Photography, treated consistently: Hospitality sells on the picture. Pick one crop ratio, one corner treatment, one hover behavior, and apply it everywhere — don't give some listings hero treatment and others a thumbnail.

8. Spend motion once: Save real animation for booking confirmation — the one moment that deserves it. Skip scroll fade-ins and hover effects on every card; that's the fastest way a UI reads templated.

9. Empty and error states that point somewhere: "No rooms for these dates" should suggest nearby dates or nearby properties, not just dead-end.