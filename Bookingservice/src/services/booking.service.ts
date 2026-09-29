import { Booking } from "@prisma/client";
import { CreateBookingDTO } from "../dto/booking.dto";
import { cancelBooking, confirmBooking, createBooking, createIdempotencyKey, deleteBooking, finalizeIdempotencyKey, getBookingById, getIdempotencyKeyWithLock, listBookings, setBookingAmount } from "../repositories/booking.repository";
import { BadRequestError, NotFoundError } from "../utils/errors/app.error";
import { generateIdempotencyKey } from "../utils/generateIdempotencyKey";
import { AuthUser } from "../middlewares/auth.middleware";


import prismaClient from "../prisma/client";
import { serverConfig } from "../config";
import { addEmailToQueue } from "../producers/email.producer";

// Same rule the frontend shows (lib/format.ts SERVICE_FEE_RATE): nightly subtotal + 12% fee.
const SERVICE_FEE_RATE = 0.12;
const FREE_CANCELLATION_MS = 48 * 60 * 60 * 1000;

/** Internal call to Hotelservice. Its error status/message (e.g. 409 "not available")
 *  is passed straight through to our caller. */
async function callHotelService<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${serverConfig.HOTEL_SERVICE_URL}/api/v1/internal${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-internal-key": serverConfig.INTERNAL_API_KEY },
        body: JSON.stringify(body),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
        throw { statusCode: response.status, message: payload?.message ?? "Hotel service error", name: "HotelServiceError" };
    }
    return payload.data as T;
}

const isoDate = (d: Date | null) => d?.toISOString().slice(0, 10);

function sendBookingEmail(booking: Booking, subject: string, templateId: string) {
    // Consumed by the Notificationservice, which renders the template and sends it.
    // Fire-and-forget: a notification failure must not fail the booking.
    addEmailToQueue({
        to: booking.userEmail,
        subject,
        templateId,
        params: {
            bookingId: booking.id,
            totalGuests: booking.totalGuests,
            bookingAmount: booking.bookingAmount,
            checkIn: isoDate(booking.checkIn),
            checkOut: isoDate(booking.checkOut),
            appName: "Airbnb",
        },
    }).catch((err) => {
        console.error(`Failed to enqueue ${templateId} email: ${err.message}`);
    });
}

export async function createBookingService(user: AuthUser, createBookingDTO: CreateBookingDTO) {
    // The booking row comes first because the room hold is keyed by its id.
    const booking = await createBooking({
        userId: user.id,
        userEmail: user.email,
        hotelId: createBookingDTO.hotelId,
        roomCategoryId: createBookingDTO.roomCategoryId,
        totalGuests: createBookingDTO.totalGuests,
        checkIn: new Date(createBookingDTO.checkIn),
        checkOut: new Date(createBookingDTO.checkOut),
        bookingAmount: 0,
    });

    let subtotal: number;
    try {
        // Atomic on the Hotelservice side: every night is held or none is.
        ({ subtotal } = await callHotelService<{ subtotal: number }>("/rooms/reserve", {
            bookingId: booking.id,
            hotelId: createBookingDTO.hotelId,
            roomCategoryId: createBookingDTO.roomCategoryId,
            checkIn: createBookingDTO.checkIn,
            checkOut: createBookingDTO.checkOut,
            guests: createBookingDTO.totalGuests,
        }));
    } catch (error) {
        await deleteBooking(booking.id);
        throw error;
    }

    // Price comes from the held rooms, never from the client.
    // ponytail: a PENDING booking that is never confirmed keeps its rooms held; add a
    // scheduled job that cancels stale PENDING bookings if abandoned checkouts show up.
    const bookingAmount = subtotal + Math.round(subtotal * SERVICE_FEE_RATE);
    await setBookingAmount(booking.id, bookingAmount);

    const idempotencyKey = generateIdempotencyKey();
    await createIdempotencyKey(idempotencyKey, booking.id);

    return {
        bookingId: booking.id,
        idempotencyKey: idempotencyKey,
        bookingAmount,
    }
}

export async function confirmBookingService(userId: number, idempotencyKey: string) {

    const booking = await prismaClient.$transaction( async(tx) => {
        const idempotencyKeyData = await getIdempotencyKeyWithLock(tx, idempotencyKey);

        if(!idempotencyKeyData || !idempotencyKeyData.bookingId) {
            throw new NotFoundError('Idempotency key not found');
        }

        const existing = await tx.booking.findUnique({ where: { id: idempotencyKeyData.bookingId } });
        if (!existing || existing.userId !== userId) {
            throw new NotFoundError('Idempotency key not found');
        }

        if(idempotencyKeyData.finalized) {
            throw new BadRequestError('Idempotency key already finalized');
        }

        if (existing.status === "CANCELLED") {
            throw new BadRequestError('This booking was cancelled');
        }

        const booking = await confirmBooking(tx, idempotencyKeyData.bookingId);
        await finalizeIdempotencyKey(tx, idempotencyKey);
        return booking;
    })

    sendBookingEmail(booking, `Booking #${booking.id} confirmed`, "booking-confirmation");
    return booking;
}

export async function cancelBookingService(userId: number, bookingId: number) {
    const booking = await getBookingById(bookingId);

    if (!booking || booking.userId !== userId) {
        throw new NotFoundError(`Booking ${bookingId} not found`);
    }

    if (booking.status === "CANCELLED") {
        throw new BadRequestError('This booking is already cancelled');
    }

    if (booking.checkIn && booking.checkIn.getTime() - Date.now() < FREE_CANCELLATION_MS) {
        throw new BadRequestError('Free cancellation closes 48 hours before check-in');
    }

    // Free the nights first: if this fails nothing has changed and the guest can retry.
    await callHotelService("/rooms/release", { bookingId });
    const cancelled = await cancelBooking(bookingId);

    sendBookingEmail(cancelled, `Booking #${cancelled.id} cancelled`, "booking-cancellation");
    return cancelled;
}

export async function listBookingsService(userId: number) {
    const bookings = await listBookings(userId);
    return bookings;
}
