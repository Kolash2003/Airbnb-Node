import { differenceInCalendarDays, format, parseISO } from "date-fns";
import type { Hotel } from "./api/types";

/** Price transparency (DESIGN.md §8.5): one rule, applied everywhere —
 *  per-night rate × nights + fixed service fee = total, shown before checkout. */

export const SERVICE_FEE_RATE = 0.12;

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateLabel(iso: string): string {
  return format(parseISO(iso), "EEE, d MMM yyyy");
}

export function nightsBetween(checkinISO: string, checkoutISO: string): number {
  return Math.max(0, differenceInCalendarDays(parseISO(checkoutISO), parseISO(checkinISO)));
}

export interface NightlyRate {
  rate: number;
  /** True when the backend gave us no price (gap §7.6) and we estimated one. */
  estimated: boolean;
}

export function nightlyRateFor(hotel: Pick<Hotel, "id" | "price">): NightlyRate {
  if (typeof hotel.price === "number" && hotel.price > 0) {
    return { rate: hotel.price, estimated: false };
  }
  // hotels.price exists in the DB migration but is not selected by the
  // Sequelize model, and room prices have no read endpoint — so the frontend
  // estimates deterministically (stable per hotel) until the backend exposes
  // a real price. Shown with an "estimated" label, never as fact.
  const seed = hotel.id * 791;
  const rate = Math.round((1800 + (seed % 5200)) / 50) * 50;
  return { rate, estimated: true };
}

export function bookingTotal(rate: number, nights: number) {
  const subtotal = rate * nights;
  const fee = Math.round(subtotal * SERVICE_FEE_RATE);
  return { subtotal, fee, total: subtotal + fee };
}

export const ROOM_TYPE_LABELS: Record<string, string> = {
  SINGLE: "Single",
  DOUBLE: "Double",
  FAMILY: "Family",
  DELUXE: "Deluxe",
  SUITE: "Suite",
};

export const IDEMPOTENCY_KEY_KEY = "haven.booking.idempotencyKey";
