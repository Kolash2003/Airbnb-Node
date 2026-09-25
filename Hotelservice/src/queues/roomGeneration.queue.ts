import { Queue } from "bullmq";
import { getRedisConnObject } from "../config/redis.config";
import logger from "../config/logger.config";

export const ROOM_GENERATION_QUEUE = "queue-room-generation";

export const roomGenerationQueue = new Queue(ROOM_GENERATION_QUEUE, {
    connection: getRedisConnObject(),
});

// BullMQ re-emits Redis connection errors on the Queue. Without a listener the
// 'error' event is an uncaught exception that crashes the process (nodemon
// restart-loop → a wedged instance that holds the port but never serves HTTP).
roomGenerationQueue.on("error", (err) => {
    logger.error(`Room generation queue error: ${err.message}`);
});


