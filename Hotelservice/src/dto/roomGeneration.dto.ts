import { z } from "zod";

export const RoomgenerationRequest = z.object({
    roomCategoryId: z.number().positive(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    scheduleType: z.enum(['immediate', 'scheduled']).default('immediate'),
    scheduledAt: z.string().datetime().optional(),
    priceOverride: z.number().positive().optional(),
});

export const RoomGenerationJobSchema = z.object({
    roomCategoryId: z.number().positive(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    priceOverride: z.number().positive().optional(),
    batchSize: z.number().positive().default(100),
})

// we need to do this if we want to use this dto as a variable tyoe in our functions
export type RoomGenerationJobSchema = z.infer<typeof RoomGenerationJobSchema>;
export type RoomgenerationRequest = z.infer<typeof RoomgenerationRequest>;


export interface RoomGenerationResponse {
    success: boolean;
    totalRoomsCreated: number;
    totalDatesProcessed: number;
    errors: string[];
    jobId: string;
}