import { z } from "zod";

export const hotelSchema = z.object({
    name: z.string().min(1),
    address: z.string().min(1),
    location: z.string().min(1),
    rating: z.number().optional(),
    ratingCount: z.number().optional(),
})

// Admin edit: any subset of the editable fields; unknown keys (rating, deletedAt…) are rejected.
export const hotelUpdateSchema = z.object({
    name: z.string().trim().min(1),
    address: z.string().trim().min(1),
    location: z.string().trim().min(1),
    price: z.number().int().nonnegative(),
    imageUrl: z.string().url().max(2048).nullable(),
}).partial().strict()

export const reviewSchema = z.object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().trim().min(10, { message: "Tell other guests a little more (10+ characters)" }).max(2000),
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