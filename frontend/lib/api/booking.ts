import { request } from "./client";
import type {
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
