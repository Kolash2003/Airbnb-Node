import logger from "../config/logger.config";
import Hotel from "../db/models/hotel";
// import { createHotelDTO } from "../dto/hotel.dto";
import { NotFoundError } from "../utils/errors/app.error";
import BaseRepository from "./base.repository";

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
}
