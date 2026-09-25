import { CreateBookingDTO } from "../dto/booking.dto";
import { confirmBooking, createBooking, createIdempotencyKey, finalizeIdempotencyKey, getIdempotencyKeyWithLock, listBookings } from "../repositories/booking.repository";
import { BadRequestError, InternalServerError, NotFoundError } from "../utils/errors/app.error";
import { generateIdempotencyKey } from "../utils/generateIdempotencyKey";


import prismaClient from "../prisma/client";
import { redlock } from "../config/redis.config";
import { serverConfig } from "../config";
import { addEmailToQueue } from "../producers/email.producer";
import { NotificationDto } from "../dto/notification.dto";

export async function createBookingService(createBookingDTO: CreateBookingDTO) {

    const ttl = serverConfig.LOCK_TTL;
    const bookingResource = `hotel:${createBookingDTO.hotelId}`; // this hotel locked 

    try {
        await redlock.acquire([bookingResource], ttl);
        const booking = await createBooking({
            userId: createBookingDTO.userId,
            hotelId: createBookingDTO.hotelId,
            totalGuests: createBookingDTO.totalGuests,
            bookingAmount: createBookingDTO.bookingAmount,
            userEmail: createBookingDTO.userEmail,
        });
    
        const idempotencyKey = generateIdempotencyKey();
        
        await createIdempotencyKey(idempotencyKey, booking.id);
    
        return {
            bookingId: booking.id, 
            idempotencyKey: idempotencyKey,
        }
    } catch (error) {
        throw new InternalServerError('Failed to acquire lock for booking resource')
    }

}

export async function confirmBookingService(idempotencyKey: string) {

    return await prismaClient.$transaction( async(tx) => {
        const idempotencyKeyData = await getIdempotencyKeyWithLock(tx, idempotencyKey);
    
        if(!idempotencyKeyData || !idempotencyKeyData.bookingId) {
            throw new NotFoundError('Idempotency key not found');
        }
    
        if(idempotencyKeyData.finalized) {
            throw new BadRequestError('Idempotency key already finalized');
        }
    
const booking = await confirmBooking(tx, idempotencyKeyData.bookingId);
        await finalizeIdempotencyKey(tx, idempotencyKey);

        // Enqueue the confirmation email to the shared mailer queue. Consumed
        // by the Notificationservice, which renders the template and sends it.
        // Fire-and-forget: a notification failure must not fail the booking.
        if (booking.userEmail) {
            const notification: NotificationDto = {
                to: booking.userEmail,
                subject: `Booking #${booking.id} confirmed`,
                templateId: "booking-confirmation",
                params: {
                    bookingId: booking.id,
                    totalGuests: booking.totalGuests,
                    bookingAmount: booking.bookingAmount,
                    appName: "Airbnb",
                },
            };
            addEmailToQueue(notification).catch((err) => {
                console.error(`Failed to enqueue confirmation email: ${err.message}`);
            });
        }

        return booking;
    })

}

export async function listBookingsService(userId?: number) {
    const bookings = await listBookings(userId);
    return bookings;
}