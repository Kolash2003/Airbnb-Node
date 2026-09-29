import { RoomGenerationJobSchema } from "../dto/roomGeneration.dto";
import { roomGenerationQueue } from "../queues/roomGeneration.queue";
import { ROLLING_INVENTORY_NIGHTS } from "../repositories/roomRepository";

export const ROOM_GENERATION_PAYLOAD = "payload:room-generation";

export const addRoomGenerationJobToQueue = async(payload: RoomGenerationJobSchema) => {
    await roomGenerationQueue.add(ROOM_GENERATION_PAYLOAD, payload);
}

export const ROLLING_INVENTORY_PAYLOAD = "payload:rolling-inventory";

/** Daily at 00:05 UTC (just after the DB's current_date rolls over), top up every
 *  hotel's inventory so the booking window slides forward by a day. Upsert is
 *  idempotent: restarts and multiple instances keep a single schedule in Redis. */
export const scheduleRollingInventory = async () => {
    await roomGenerationQueue.upsertJobScheduler(
        "rolling-inventory-daily",
        { pattern: "5 0 * * *", tz: "UTC" },
        { name: ROLLING_INVENTORY_PAYLOAD, data: { nights: ROLLING_INVENTORY_NIGHTS } },
    );
    // Also run once now so a service that was down over midnight catches up.
    await roomGenerationQueue.add(ROLLING_INVENTORY_PAYLOAD, { nights: ROLLING_INVENTORY_NIGHTS });
}
