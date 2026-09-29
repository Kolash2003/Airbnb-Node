import { createHotelDTO, updateHotelDTO } from "../dto/hotel.dto";
import { NotFoundError } from "../utils/errors/app.error";
// import { createHotel, getAllHotels, getHotelById } from "../repositories/hotel.repository";
import { HotelRepository, HotelSearchParams } from "../repositories/hotel.repository";
import RoomCategory from "../db/models/roomCategory";
import Hotel from "../db/models/hotel";

const hotelRepository = new HotelRepository(); // create an object and use its methods

export async function createHotelservice(hotelData: createHotelDTO) {
    const hotel = await hotelRepository.create(hotelData);
    return hotel;
}

export async function getHotelByIdService(id: number) {
    const hotel = await hotelRepository.findById(id);
    if (!hotel) return hotel;
    const roomCategories = await RoomCategory.findAll({
        where: { hotelId: id, deletedAt: null },
        order: [["occupancy", "ASC"]],
    });
    hotel.setDataValue("roomCategories", roomCategories);
    return hotel;
}

export async function getAllHotelsService(searchParams?: HotelSearchParams) {
    const hasSearchParams = searchParams?.q || searchParams?.checkin || searchParams?.checkout || searchParams?.guests;

    if (hasSearchParams) {
        const hotelResponse = await hotelRepository.search(searchParams);
        return attachMaxOccupancy(hotelResponse);
    }

    const hotelResponse = await hotelRepository.findAll();
    return attachMaxOccupancy(hotelResponse);
}

async function attachMaxOccupancy(hotels: Hotel[]) {
    const maxOccupancyByHotel = await hotelRepository.findMaxOccupancyByHotel();
    for (const hotel of hotels) {
        const maxOccupancy = maxOccupancyByHotel[hotel.id];
        if (maxOccupancy) hotel.setDataValue("maxOccupancy", maxOccupancy);
    }
    return hotels;
}

export async function updateHotelService(id: number, hotelData: updateHotelDTO) {
    const hotel = await hotelRepository.findById(id);
    if (!hotel || hotel.deletedAt) throw new NotFoundError(`Hotel with id ${id} not found`);
    return hotelRepository.update(id, hotelData);
}

export async function deleteHotelService(id: number) {
    const respone = await hotelRepository.softDelete(id);
    return respone;
}

