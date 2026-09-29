import { Request, Response, NextFunction } from "express";
import { cancelBookingService, confirmBookingService, createBookingService, listBookingsService } from "../services/booking.service";
import { AuthUser } from "../middlewares/auth.middleware";

export const createBookingHandler = async(req: Request, res: Response, next: NextFunction) => {
    const booking = await createBookingService(res.locals.user as AuthUser, req.body);

    res.status(201).json({
        bookingId: booking.bookingId,
        idempotencyKey: booking.idempotencyKey,
        bookingAmount: booking.bookingAmount,
    });
}

export const confirmBookingHandler = async(req: Request, res: Response) => {
    const booking = await confirmBookingService((res.locals.user as AuthUser).id, req.params.idempotencyKey);

    res.status(201).json({
        bookingId: booking.id,
        status: booking.status,
    });
}

export const cancelBookingHandler = async(req: Request, res: Response) => {
    const booking = await cancelBookingService((res.locals.user as AuthUser).id, Number(req.params.id));

    res.status(200).json({
        bookingId: booking.id,
        status: booking.status,
    });
}

export const listBookingsHandler = async(req: Request, res: Response) => {
    const bookings = await listBookingsService((res.locals.user as AuthUser).id);

    res.status(200).json({
        bookings,
        count: bookings.length,
    });
}
