import { QueryTypes, UniqueConstraintError } from "sequelize";
import sequelize from "../db/models/sequelize";
import { serverConfig } from "../config";
import { ConflictError, ForbiddenError, NotFoundError } from "../utils/errors/app.error";

export type CreateReviewDTO = { rating: number; comment: string };

export async function listReviewsService(hotelId: number) {
    return sequelize.query(
        `SELECT id, hotel_id AS "hotelId", user_id AS "userId", rating, comment, created_at AS "createdAt"
         FROM reviews WHERE hotel_id = :hotelId ORDER BY created_at DESC`,
        { replacements: { hotelId }, type: QueryTypes.SELECT }
    );
}

/** Only guests whose confirmed stay has ended may review. The booking service is the
 *  source of truth, so ask it for the caller's bookings using the caller's own token. */
async function hasCompletedStay(authorization: string, hotelId: number) {
    const response = await fetch(`${serverConfig.BOOKING_SERVICE_URL}/api/v1/bookings`, {
        headers: { Authorization: authorization },
    });
    if (!response.ok) return false;
    const { bookings } = (await response.json()) as {
        bookings: Array<{ hotelId: number; status: string; checkOut: string | null }>;
    };
    const today = new Date().toISOString().slice(0, 10);
    return bookings.some(
        (b) => b.hotelId === hotelId && b.status === "CONFIRMED" && b.checkOut && b.checkOut.slice(0, 10) <= today
    );
}

export async function createReviewService(
    hotelId: number,
    userId: number,
    authorization: string,
    review: CreateReviewDTO
) {
    const [hotel]: any = await sequelize.query(`SELECT id FROM hotels WHERE id = :hotelId AND deleted_at IS NULL`, {
        replacements: { hotelId },
        type: QueryTypes.SELECT,
    });
    if (!hotel) throw new NotFoundError(`Hotel with id ${hotelId} not found`);

    if (!(await hasCompletedStay(authorization, hotelId))) {
        throw new ForbiddenError("You can review a stay after your confirmed booking has checked out");
    }

    try {
        return await sequelize.transaction(async (transaction) => {
            const [created]: any = await sequelize.query(
                `INSERT INTO reviews (hotel_id, user_id, rating, comment)
                 VALUES (:hotelId, :userId, :rating, :comment)
                 RETURNING id, hotel_id AS "hotelId", user_id AS "userId", rating, comment, created_at AS "createdAt"`,
                { replacements: { hotelId, userId, ...review }, transaction, type: QueryTypes.SELECT }
            );
            // Fold the new score into the running average so seeded ratings keep their weight.
            await sequelize.query(
                `UPDATE hotels SET
                   rating = ROUND((COALESCE(rating, 0) * COALESCE(rating_count, 0) + :rating) / (COALESCE(rating_count, 0) + 1), 2),
                   rating_count = COALESCE(rating_count, 0) + 1
                 WHERE id = :hotelId`,
                { replacements: { hotelId, rating: review.rating }, transaction }
            );
            return created;
        });
    } catch (error) {
        if (error instanceof UniqueConstraintError) throw new ConflictError("You have already reviewed this stay");
        throw error;
    }
}
