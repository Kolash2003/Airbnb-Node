import { NextFunction, Request, Response } from "express";
import { createHotelservice, getAllHotelsService, getHotelByIdService } from "../services/hotel.service";
import { deleteHotelService } from "../services/hotel.service";

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

export async function deleteHotelHandler(req: Request, res: Response, next: NextFunction) {
    const hotelDelteResonse = await deleteHotelService(Number(req.params.id));

    res.status(201).json({
        message: "Hotel deleted sucessfully",
        data: hotelDelteResonse,
        success: true,
    });
}

export async function getAllHotelsHandler(req: Request, res: Response, next: NextFunction) {
    const { q, checkin, checkout, guests } = req.query;
    const allHotelsResponse = await getAllHotelsService({
        q: typeof q === "string" ? q : undefined,
        checkin: typeof checkin === "string" ? checkin : undefined,
        checkout: typeof checkout === "string" ? checkout : undefined,
        guests: typeof guests === "string" && guests !== "" ? Number(guests) : undefined,
    });

    res.status(201).json({
        message: "All hotels data sent",
        data: allHotelsResponse,
        success: true,
    })
}
