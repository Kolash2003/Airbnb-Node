import { Request, Response, NextFunction } from "express";
import { confirmBookingService, createBookingService, listBookingsService } from "../services/booking.service";

export const createBookingHandler = async(req: Request, res: Response, next: NextFunction) => {
    const booking = await createBookingService(req.body);

    res.status(201).json({
        bookingId: booking.bookingId,
        idempotencyKey: booking.idempotencyKey,
    });
}

export const confirmBookingHandler = async(req: Request, res: Response) => {
    const booking = await confirmBookingService(req.params.idempotencyKey);

    res.status(201).json({
        bookingId: booking.id,
        status: booking.status,
    });
}

export const listBookingsHandler = async(req: Request, res: Response) => {
    const userId = typeof req.query.userId === "string" ? Number(req.query.userId) : undefined;

    const bookings = await listBookingsService(userId);

    res.status(200).json({
        bookings,
        count: bookings.length,
    });
}