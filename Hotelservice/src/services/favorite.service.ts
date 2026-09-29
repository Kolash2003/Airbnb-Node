import { QueryTypes } from "sequelize";
import sequelize from "../db/models/sequelize";
import { NotFoundError } from "../utils/errors/app.error";

export async function listFavoriteIdsService(userId: number): Promise<number[]> {
    const rows = await sequelize.query<{ hotelId: number }>(
        `SELECT f.hotel_id AS "hotelId" FROM favorites f
         JOIN hotels h ON h.id = f.hotel_id AND h.deleted_at IS NULL
         WHERE f.user_id = :userId ORDER BY f.created_at DESC`,
        { replacements: { userId }, type: QueryTypes.SELECT }
    );
    return rows.map((r) => r.hotelId);
}

export async function addFavoriteService(userId: number, hotelId: number) {
    const [hotel] = await sequelize.query(`SELECT id FROM hotels WHERE id = :hotelId AND deleted_at IS NULL`, {
        replacements: { hotelId },
        type: QueryTypes.SELECT,
    });
    if (!hotel) throw new NotFoundError(`Hotel with id ${hotelId} not found`);

    // Idempotent: saving twice is a no-op.
    await sequelize.query(
        `INSERT INTO favorites (user_id, hotel_id) VALUES (:userId, :hotelId) ON CONFLICT DO NOTHING`,
        { replacements: { userId, hotelId } }
    );
}

export async function removeFavoriteService(userId: number, hotelId: number) {
    await sequelize.query(`DELETE FROM favorites WHERE user_id = :userId AND hotel_id = :hotelId`, {
        replacements: { userId, hotelId },
    });
}
