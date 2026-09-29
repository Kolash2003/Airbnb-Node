import express from 'express';
import { z } from 'zod';
import { requireInternalKey } from '../../middlewares/auth.middleware';
import { validateRequestBody } from '../../validators';
import RoomRepository from '../../repositories/roomRepository';

// Called by Bookingservice only (shared x-internal-key), never by the browser.
const internalRouter = express.Router();
const roomRepository = new RoomRepository();

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const reserveSchema = z.object({
    bookingId: z.number().int().positive(),
    hotelId: z.number().int().positive(),
    roomCategoryId: z.number().int().positive(),
    checkIn: date,
    checkOut: date,
    guests: z.number().int().positive(),
});

internalRouter.use(requireInternalKey);

internalRouter.post('/rooms/reserve', validateRequestBody(reserveSchema), async (req, res) => {
    const subtotal = await roomRepository.reserve(req.body);
    res.status(200).json({ message: "Rooms reserved", data: { subtotal }, success: true });
});

internalRouter.post('/rooms/release', validateRequestBody(z.object({ bookingId: z.number().int().positive() })), async (req, res) => {
    await roomRepository.release(req.body.bookingId);
    res.status(200).json({ message: "Rooms released", data: null, success: true });
});

export default internalRouter;
