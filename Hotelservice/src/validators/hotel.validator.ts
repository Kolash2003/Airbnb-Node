import { z } from "zod";

export const hotelSchema = z.object({
    name: z.string().min(1),
    address: z.string().min(1),
    location: z.string().min(1),
    rating: z.number().optional(),
    ratingCount: z.number().optional(),
})

export const hotelDeleteSchema = z.object({
    id: z.string().min(1),
})

export const hotelSearchQuerySchema = z.object({
    q: z.string().trim().optional(),
    checkin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    checkout: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    guests: z.coerce.number().int().positive().optional(),
})