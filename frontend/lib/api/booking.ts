import { request } from "./client";
import type {
  Booking,
  ConfirmBookingResponse,
  CreateBookingInput,
  CreateBookingResponse,
} from "./types";

/** Step 1 of the two-step flow: returns bookingId + idempotencyKey. The
 *  caller owns persisting the key (sessionStorage + URL) until step 2. */
export function createBooking(input: CreateBookingInput): Promise<CreateBookingResponse> {
  return request<CreateBookingResponse>("booking", "/bookings", {
    method: "POST",
    body: input,
  });
}

/** Step 2: finalize with the key from step 1. Safe to retry — the service
 *  rejects already-finalized keys instead of double-booking. */
export function confirmBooking(idempotencyKey: string): Promise<ConfirmBookingResponse> {
  return request<ConfirmBookingResponse>("booking", `/bookings/confirm/${idempotencyKey}`, {
    method: "POST",
  });
}

export interface BookingList {
  bookings: Booking[];
  count: number;
}

/** The signed-in user's bookings — the service reads the user from the JWT. */
export function listBookings(): Promise<BookingList> {
  return request<BookingList>("booking", "/bookings");
}

/** Allowed until 48h before check-in; frees the held nights. */
export function cancelBooking(bookingId: number): Promise<ConfirmBookingResponse> {
  return request<ConfirmBookingResponse>("booking", `/bookings/${bookingId}/cancel`, {
    method: "POST",
  });
}
