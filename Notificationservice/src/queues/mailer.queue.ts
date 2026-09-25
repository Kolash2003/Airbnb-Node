import { Queue } from "bullmq";
import { getRedisConnObject } from "../config/redis.config";
import logger from "../config/logger.config";

export const MAILER_QUEUE = "queue-mailer";

export const mailerQueue = new Queue(MAILER_QUEUE, {
    connection: getRedisConnObject(),
});

// BullMQ re-emits Redis connection errors on the Queue. Without a listener the
// 'error' event is an uncaught exception that crashes the process.
mailerQueue.on("error", (err) => {
    logger.error(`Mailer queue error: ${err.message}`);
});



