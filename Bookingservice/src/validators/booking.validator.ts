import { z } from "zod";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Dates must be YYYY-MM-DD" });

export const createBookingSchema = z.object({
    hotelId: z.number({ message: "Hotel ID must be present" }).int().positive(),
    roomCategoryId: z.number({ message: "Pick a room type" }).int().positive(),
    totalGuests: z.number({ message: "Total guests must be present" }).int().min(1, { message: "Total guests must be at least 1" }),
    checkIn: date,
    checkOut: date,
}).refine((b) => b.checkIn >= new Date().toISOString().slice(0, 10), { message: "Check-in can't be in the past" })
  .refine((b) => b.checkOut > b.checkIn, { message: "Check-out must be after check-in" })
