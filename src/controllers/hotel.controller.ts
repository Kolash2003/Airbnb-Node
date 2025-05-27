import { NextFunction, Request, Response } from "express";
import { createHotelservice, getHotelByIdService } from "../services/hotel.service";

export async function createHotelHandler(req: Request, res: Response, next: NextFunction) {
    const hotelResponse = await createHotelservice(req.body);

    res.status(201).json({
        message: "Hotel created sucessfully",
        data: hotelResponse,
        success: true,
    });
} 

export async function getHotelByIdHandler(req: Request, res: Response, next: NextFunction) {
    const hotelidResponse = await getHotelByIdService(Number(req.params.id));

    res.status(201).json({
        message: "Hotel found sucessfully",
        data: hotelidResponse,
        success: true,
    });
}
