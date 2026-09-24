// Shared TypeScript contracts, hand-written from the backend DTOs
// (DESIGN.md §4.11). Single source of truth for all service shapes.

export type RoomType = "SINGLE" | "DOUBLE" | "FAMILY" | "DELUXE" | "SUITE";

export interface Hotel {
  id: number;
  name: string;
  address: string;
  location: string;
  rating: number | null;
  ratingCount: number | null;
  /** Not selected by the Sequelize model (backend gap §7.6); may be absent. */
  price?: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface RoomCategory {
  id: number;
  hotelId: number;
  price: number;
  roomType: RoomType;
  roomCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Room {
  id: number;
  hotelId: number;
  roomCategoryId: number;
  dateofAvailability: string;
  price: number;
  bookingId: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export interface Booking {
  id: number;
  userId: number;
  hotelId: number;
  totalGuests: number;
  bookingAmount: number;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingResponse {
  bookingId: number;
  idempotencyKey: string;
}

export interface ConfirmBookingResponse {
  bookingId: number;
  status: BookingStatus;
}

/** Normalized auth user. The Go profile payload uses capitalized keys and
 *  leaks the bcrypt hash — both fixed at the boundary in lib/api/auth.ts. */
export interface User {
  id: number;
  username: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
  /** Roles are NOT returned by /profile (backend gap); filled when known. */
  roles: string[];
}

export interface Role {
  id: number;
  name: string;
  description?: string;
}

export interface Permission {
  id: number;
  name: string;
  description?: string;
}

export interface CreateHotelInput {
  name: string;
  address: string;
  location: string;
  rating?: number;
  ratingCount?: number;
}

export interface RoomGenerationInput {
  roomCategoryId: number;
  startDate: string;
  endDate: string;
  priceOverride?: number;
  batchSize?: number;
}

export interface CreateBookingInput {
  userId: number;
  hotelId: number;
  totalGuests: number;
  bookingAmount: number;
}
