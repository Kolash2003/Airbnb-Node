import { NextFunction, Request, Response } from "express";
import { createHotelservice, getAllHotelsService, getHotelByIdService } from "../services/hotel.service";
import { deleteHotelService, updateHotelService } from "../services/hotel.service";
import { createReviewService, listReviewsService } from "../services/review.service";
import { AuthUser } from "../middlewares/auth.middleware";

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


export async function updateHotelHandler(req: Request, res: Response, next: NextFunction) {
    const hotel = await updateHotelService(Number(req.params.id), req.body);

    res.status(200).json({
        message: "Hotel updated successfully",
        data: hotel,
        success: true,
    });
}

export async function listReviewsHandler(req: Request, res: Response, next: NextFunction) {
    const reviews = await listReviewsService(Number(req.params.id));

    res.status(200).json({
        message: "Reviews fetched successfully",
        data: reviews,
        success: true,
    });
}

export async function createReviewHandler(req: Request, res: Response, next: NextFunction) {
    const user = res.locals.user as AuthUser;
    const review = await createReviewService(Number(req.params.id), user.id, req.headers.authorization!, req.body);

    res.status(201).json({
        message: "Review posted successfully",
        data: review,
        success: true,
    });
}
