import { Job, Worker } from "bullmq";
import { ROOM_GENERATION_QUEUE } from "../queues/roomGeneration.queue";
import { RoomGenerationJobSchema } from "../dto/roomGeneration.dto";
import { getRedisConnObject } from "../config/redis.config";
import { ROOM_GENERATION_PAYLOAD } from "../producer/roomGeneration.producer";
import logger from "../config/logger.config";
import { generateRooms } from "../services/roomGeneration.service";

export const setupRoomGenerationWorker = () => {
    const roomGenerationProcessor = new Worker<RoomGenerationJobSchema>(
    ROOM_GENERATION_QUEUE, // Name of the queue
    async (job: Job ) => {
        if(job.name !== ROOM_GENERATION_PAYLOAD) {
            throw new Error("Invalid job name");
        }

        const payload = job.data;
        console.log(`Processing room generation job: ${JSON.stringify(payload)}`);

        await generateRooms(payload);
        logger.info(`Room generation job completed for room category ${payload.roomCategoryId} from ${payload.startDate} to ${payload.endDate}`);

        }, // Process function
        {
            connection: getRedisConnObject()
        } // Which redis connection to use
    )

    roomGenerationProcessor.on("failed", () => {
        console.error("Room Generation failed");
    });

    roomGenerationProcessor.on("completed", () => {
        console.log("Room Generation completed sucessfully");
    });
}

