import { NextFunction, Request, Response } from "express";
import { addRoomGenerationJobToQueue } from "../producer/roomGeneration.producer";

export async function generateRoomsFromJob(req: Request, res: Response, next: NextFunction) {
    
    await addRoomGenerationJobToQueue(req.body);

    res.status(201).json({
        message: "Rooms generation job added to queue",
        data: {},
        success: true,
    });
}