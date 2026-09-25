import logger from "../config/logger.config";
import Hotel from "../db/models/hotel";
import sequelize from "../db/models/sequelize";
// import { createHotelDTO } from "../dto/hotel.dto";
import { NotFoundError } from "../utils/errors/app.error";
import BaseRepository from "./base.repository";

export interface HotelSearchParams {
    q?: string;
    checkin?: string;
    checkout?: string;
    guests?: number;
}

// export async function createHotel(hotelData: createHotelDTO) {
//     const hotel = await Hotel.create({
//         name: hotelData.name,
//         address: hotelData.address,
//         location: hotelData.location,
//         rating: hotelData.rating,
//         ratingCount: hotelData.ratingCount,
//     });

//     logger.info(`Hotel created: ${hotel.id}`);

//     return hotel;
// }

// export async function getHotelById(id: number) {
//     const hotel = await Hotel.findByPk(id);

//     if(!hotel) {
//         logger.error(`Hotel not found: ${id}`);
//         throw new NotFoundError(`Hotel with id ${id} not found`);
//     }

//     logger.info(`Hotel found: ${hotel.id}`);

//     return hotel;
// }

// export async function deleteHotel(id: number) {
//     const hotel = await Hotel.findByPk(id);

//     if(!hotel) {
//         logger.error(`No hotels found ${id}`);
//         throw new NotFoundError(`hotel with id ${id} not found`);
//     }

//     hotel.deleted_At = new Date();
//     await hotel.save();
//     logger.info(`Hotels soft deleted; ${hotel.id}`);
//     return hotel;

// }

// export async function getAllHotels() {
//     const allHotels = await Hotel.findAll({
//         where: {
//             deleted_At: null,
//         }
//     });

//     if(!allHotels) {
//         logger.error(`No hotels found`);
//         throw new NotFoundError(`No hotels found`);
//     }

//     logger.info(`Hotels found: ${allHotels.length}`);
//      return allHotels;
// }

export class HotelRepository extends BaseRepository<Hotel> {
    constructor() {
        super(Hotel);
    }

    async findAll() { // this findAll is going to make sure we override the findAll in the base repository
        const hotels = await this.model.findAll({
            where: {
                deletedAt: null
            }
        });

        if(hotels.length === 0) {
            logger.error(`NO hotels found`);
            throw new NotFoundError(`No hotels found`);
        }

        logger.info(`Hotels found: ${hotels.length}`);
        return hotels;
    }

    async softDelete(id: number) {
        const hotel = await Hotel.findByPk(id);

        if(!hotel) {
            logger.error(`Hotel not found: ${id}`);
            throw new NotFoundError(`Hotel with id ${id} not found`);
        } 

        hotel.deletedAt = new Date();
        await hotel.save();
        logger.info(`Hotel soft deleted: ${hotel.id}`);
        return true; 
    }

    /** Largest occupancy across a hotel's room types, keyed by hotel id. */
    async findMaxOccupancyByHotel(): Promise<Record<number, number>> {
        const [rows]: any = await sequelize.query(`
            SELECT "hotel_id" AS "hotelId", MAX("occupancy") AS "maxOccupancy"
            FROM room_categories
            WHERE "deleted_at" IS NULL
            GROUP BY "hotel_id"
        `);
        return Object.fromEntries(
            rows.map((r: { hotelId: number; maxOccupancy: string }) => [r.hotelId, Number(r.maxOccupancy)])
        );
    }

    async search(params: HotelSearchParams) {
        const conditions: string[] = [`hotel."deleted_at" IS NULL`];
        const replacements: Record<string, unknown> = {};

        const query = params.q?.trim();
        if (query) {
            const escaped = query.replace(/[\\%_]/g, (m) => `\\${m}`);
            conditions.push(`
                (
                    hotel."name" ILIKE :q ESCAPE '\\' OR
                    hotel."address" ILIKE :q ESCAPE '\\' OR
                    hotel."location" ILIKE :q ESCAPE '\\' OR
                    similarity(hotel."name", :qRaw) >= :minSimilarity OR
                    similarity(hotel."address", :qRaw) >= :minSimilarity OR
                    similarity(hotel."location", :qRaw) >= :minSimilarity
                )
            `);
            replacements.q = `%${escaped}%`;
            replacements.qRaw = query;
            replacements.minSimilarity = 0.3;
        }

        if (params.checkin && params.checkout) {
            conditions.push(`
                EXISTS (
                    SELECT 1 FROM rooms r
                    WHERE r."hotels_id" = hotel."id"
                      AND r."deleted_at" IS NULL
                      AND r."booking_id" IS NULL
                      AND r."date_of_availability" >= :checkin::date
                      AND r."date_of_availability" < :checkout::date
                )
            `);
            replacements.checkin = params.checkin;
            replacements.checkout = params.checkout;
        }

        if (params.guests && params.guests > 0) {
            conditions.push(`
                EXISTS (
                    SELECT 1 FROM room_categories rc
                    WHERE rc."hotel_id" = hotel."id"
                      AND rc."deleted_at" IS NULL
                      AND rc."occupancy" >= :guests
                )
            `);
            replacements.guests = params.guests;
        }

        const orderBy = query
            ? `ORDER BY GREATEST(
                similarity(hotel."name", :qRaw),
                similarity(hotel."address", :qRaw),
                similarity(hotel."location", :qRaw)
              ) DESC, hotel."id" ASC`
            : `ORDER BY hotel."id" ASC`;

        const sql = `
            SELECT hotel.* FROM hotels AS hotel
            WHERE ${conditions.join(" AND ")}
            ${orderBy}
        `;

        const hotels = await sequelize.query(sql, {
            replacements,
            model: Hotel,
            mapToModel: true,
        });

        if (hotels.length === 0) {
            logger.error(`No hotels found matching search`);
            throw new NotFoundError(`No hotels found`);
        }

        logger.info(`Hotels found: ${hotels.length}`);
        return hotels;
    }
}
