# Design: Room Types & Occupancy (Booking.com-style)

> Status: Approved — Approach 1 (embed room types + occupancy aggregates)
> Date: 2026-09-25

## Problem

Hotels have a single estimated price on the frontend; the backend already models
`room_categories` (roomType, roomCount, price) but exposes no read path and has no
occupancy concept. When a user searches for N guests, cards neither reflect fit
nor show what room types a hotel actually offers.

## Goals

1. Each room type has an `occupancy` (max guests it can hold).
2. Homepage search with N guests filters to hotels with any room type where
   `occupancy >= N`, sorts best-fit-first, and shows a "Fits up to X guests" badge.
3. Hotel detail page lists all room types, selectable; selection drives the real
   price and carries `roomCategoryId` into the booking flow.
4. Bookings record which room type was booked.

## Backend — Hotelservice

- Migration `add-occupancy-to-room-categories`: `ALTER TABLE room_categories
  ADD COLUMN occupancy INT NOT NULL DEFAULT 1` (guarded like existing migrations).
- `RoomCategory` model gains `occupancy`.
- Seeder: SINGLE=1, DOUBLE=2, FAMILY=4, DELUXE=3, SUITE=5; backfill via `UPDATE`.
- `GET /hotels` search: `guests` filter becomes `EXISTS(room_category WHERE
  occupancy >= :guests)` (replaces `SUM(room_count) >= guests`); hotels gain a
  `maxOccupancy` field (one GROUP BY aggregate, attached in the service).
- `GET /hotels/:id` returns `{ ...hotel, roomCategories: [...] }` (room types
  with `occupancy`, `price`, `roomCount`).

## Backend — Bookingservice

- Migration + Prisma schema: `Booking.roomCategoryId Int?`.
- DTO + zod validator + service persist `roomCategoryId` (optional).

## Frontend

- Types: `occupancy` on `RoomCategory`; `maxOccupancy` on `Hotel`;
  `HotelWithCategories = Hotel & { roomCategories: RoomCategory[] }`;
  `CreateBookingInput.roomCategoryId?`.
- `getHotel` returns `HotelWithCategories`.
- Hotel detail: selectable room-type cards (name, occupancy, real price/night,
  count); default = best-fit for guests (smallest occupancy >= guests, else
  largest). Sticky panel uses the real room price; `/book` link gains
  `&roomCategoryId=N`. Estimated price (`nightlyRateFor`) is replaced once a room
  is selected.
- Homepage: "Fits up to X guests" badge from `maxOccupancy`; best-fit-first sort
  when guests searched.
- Book + confirm + summary: read `roomCategoryId`, show room label, send in
  payload; real room price flows through totals.

## Non-goals

- Date-based room availability UI per room type (rooms already carry availability;
  existing date search filter is preserved, no new availability grid).
- Admin UI for managing room categories/occupancy.

## Risks

- Room data is currently seed-driven; `roomCategoryId` on bookings is optional to
  stay backward-compatible with existing bookings.