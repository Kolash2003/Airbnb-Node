import { z } from "zod";

export const createBookingSchema = z.object({
    userId: z.number({ message: "User ID must be present" }),
    hotelId: z.number({ message: "Hotel ID must be present" }),
    roomCategoryId: z.number().int().positive().optional(),
    totalGuests: z.number({ message: "Total guests must be present" }).min(1, { message: "Total guests must be at least 1" }),
    bookingAmount: z.number({ message: "Booking amount must be present" }).min(1, { message: "Booking amount should be greater than 1" }),
    userEmail: z.string({ message: "User email must be present" }).email({ message: "User email must be a valid email" }),
})

export const bookingListQuerySchema = z.object({
    userId: z.coerce.number().int().positive().optional(),
})