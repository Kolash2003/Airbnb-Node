import logger from "../config/logger.config";
import Hotel from "../db/models/hotel";
import { createHotelDTO, deleteHotelDTO } from "../dto/hotel.dto";
import { NotFoundError } from "../utils/errors/app.error";

export async function createHotel(hotelData: createHotelDTO) {
    const hotel = await Hotel.create({
        name: hotelData.name,
        address: hotelData.address,
        location: hotelData.location,
        rating: hotelData.rating,
        ratingCount: hotelData.ratingCount,
    });

    logger.info(`Hotel created: ${hotel.id}`);

    return hotel;
}

export async function getHotelById(id: number) {
    const hotel = await Hotel.findByPk(id);

    if(!hotel) {
        logger.error(`Hotel not found: ${id}`);
        throw new NotFoundError(`Hotel with id ${id} not found`);
    }

    logger.info(`Hotel found: ${hotel.id}`);

    return hotel;
}

export async function deleteHotel(hotelData: deleteHotelDTO) {
    const hotel = await Hotel.destroy({
        where: {
            id: hotelData.id,
        }
    });

    logger.info(`Hotel ${hotelData.id} deleted`);

    return hotel;
}

export async function getAllHotels() {
    const allHotels = await Hotel.findAll();

    if(!allHotels) {
        logger.error(`No hotels found`);
        throw new NotFoundError(`No hotels found`);
    }

    logger.info(`Hotels found: ${allHotels.length}`);
     return allHotels;
}