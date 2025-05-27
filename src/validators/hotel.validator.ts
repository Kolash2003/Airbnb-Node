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