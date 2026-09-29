import { CreationAttributes } from "sequelize";
import Room from "../db/models/room";
import sequelize from "../db/models/sequelize";
import BaseRepository from "./base.repository";
import { BadRequestError, ConflictError } from "../utils/errors/app.error";

// How far ahead every room category stays bookable (seeder + daily scheduler).
export const ROLLING_INVENTORY_NIGHTS = 60;

export type ReserveRoomsInput = {
    bookingId: number;
    hotelId: number;
    roomCategoryId: number;
    checkIn: string;  // YYYY-MM-DD, first night
    checkOut: string; // YYYY-MM-DD, exclusive
    guests: number;
};


class RoomRepository extends BaseRepository<Room> {
    constructor() {
        super(Room)
    }

    async findByRoomCategoryIdAndDate(roomCategoryId: number, currentDate: Date) {
        return await this.model.findOne({
            where: {
                roomCategoryId: roomCategoryId,
                dateofAvailability: currentDate,
                deletedAt: null,
            }
        })
    }

    /**
     * Marks one room row per night in [checkIn, checkOut) as taken by bookingId and
     * returns the summed nightly price. All-or-nothing: if any night is missing or
     * already booked the transaction rolls back. The row locks taken by UPDATE make a
     * concurrent reserve re-check `booking_id IS NULL` and lose, so no double booking.
     */
    async reserve(input: ReserveRoomsInput): Promise<number> {
        const nights = Math.round((Date.parse(input.checkOut) - Date.parse(input.checkIn)) / 86_400_000);
        if (!(nights > 0)) throw new BadRequestError("Check-out must be after check-in");

        return sequelize.transaction(async (transaction) => {
            const [categories]: any = await sequelize.query(
                `SELECT occupancy FROM room_categories
                 WHERE id = :roomCategoryId AND hotel_id = :hotelId AND deleted_at IS NULL`,
                { replacements: input, transaction }
            );
            if (categories.length === 0) throw new BadRequestError("That room type does not belong to this hotel");
            if (categories[0].occupancy < input.guests) {
                throw new BadRequestError(`This room sleeps at most ${categories[0].occupancy} guests`);
            }

            const [rows]: any = await sequelize.query(
                `UPDATE rooms SET booking_id = :bookingId
                 WHERE room_category_id = :roomCategoryId
                   AND hotels_id = :hotelId
                   AND date_of_availability >= :checkIn::date
                   AND date_of_availability < :checkOut::date
                   AND booking_id IS NULL
                   AND deleted_at IS NULL
                 RETURNING price`,
                { replacements: input, transaction }
            );
            // ponytail: one room row per category per night (that is what room generation
            // creates), so roomCount is not used; model N units per night if that changes.
            if (rows.length !== nights) {
                throw new ConflictError("This room is not available for all of the selected nights");
            }
            return rows.reduce((sum: number, r: { price: number }) => sum + Number(r.price), 0);
        });
    }

    async release(bookingId: number) {
        await sequelize.query(`UPDATE rooms SET booking_id = NULL WHERE booking_id = :bookingId`, {
            replacements: { bookingId },
        });
    }

    /**
     * Keeps a rolling window of bookable nights: for every live room category, inserts
     * the missing nights from today to today + nights - 1. Idempotent, so a missed or
     * repeated run just catches up. Returns how many nights were added.
     */
    async fillRollingWindow(nights: number): Promise<number> {
        const [inserted]: any = await sequelize.query(
            `INSERT INTO rooms (hotels_id, room_category_id, date_of_availability, price)
             SELECT rc.hotel_id, rc.id, d::date, rc.price
             FROM room_categories rc
             JOIN hotels h ON h.id = rc.hotel_id AND h.deleted_at IS NULL
             CROSS JOIN generate_series(current_date, current_date + (:nights - 1), interval '1 day') AS d
             WHERE rc.deleted_at IS NULL AND NOT EXISTS (
                 SELECT 1 FROM rooms r
                 WHERE r.room_category_id = rc.id AND r.date_of_availability = d::date AND r.deleted_at IS NULL
             )
             RETURNING id`,
            { replacements: { nights } }
        );
        return inserted.length;
    }

    async bulkCreate(rooms: CreationAttributes<Room>[]) {
        return await this.model.bulkCreate(rooms);
    }
}

export default RoomRepository;