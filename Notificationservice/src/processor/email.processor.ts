import { Job, Worker } from "bullmq";
import { MAILER_QUEUE } from "../queues/mailer.queue";
import { NotificationDto } from "../dto/notification.dto";
import { getRedisConnObject } from "../config/redis.config";
import { MAILER_PAYLOAD } from "../producer/email.producer";
import { rendermailTemplate } from "../template/templates.handler";
import { sendEmail } from "../services/mailer.service";
import logger from "../config/logger.config";

export const setupMailerWorker = () => {
    const emailProcessor = new Worker<NotificationDto>(
    MAILER_QUEUE, // Name of the queue
    async (job: Job ) => {
        if(job.name !== MAILER_PAYLOAD) {
            throw new Error("Invalid job name");
        }

        // call the service layer from here.

        const payload = job.data;
        console.log(`Processing email: ${JSON.stringify(payload)}`);

        const emailContent = await rendermailTemplate(payload.templateId, payload.params);

        await sendEmail(payload.to, payload.subject, emailContent);

        logger.info(`Email sent to ${payload.to} with subject "${payload.subject}"`)

        }, // Process function
        {
            connection: getRedisConnObject()
        } // Which redis connection to use
    )

    emailProcessor.on("failed", () => {
        console.error("Email processing failed");
    });

    emailProcessor.on("completed", () => {
        console.log("Email processing completed sucessfully");
    });
}

