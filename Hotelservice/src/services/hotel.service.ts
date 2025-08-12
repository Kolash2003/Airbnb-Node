import { createHotelDTO } from "../dto/hotel.dto";
// import { createHotel, getAllHotels, getHotelById } from "../repositories/hotel.repository";
import { HotelRepository } from "../repositories/hotel.repository";

const hotelRepository = new HotelRepository();
export async function createHotelservice(hotelData: createHotelDTO) {
    const hotel = await hotelRepository.create(hotelData);
    return hotel;
}

export async function getHotelByIdService(id: number) {
    const hotel = await hotelRepository.findById(id);
    return hotel;
}

export async function getAllHotelsService() {
    const hotelResponse = await hotelRepository.findAll();
    return hotelResponse;
}

export async function deleteHotelService(id: number) {
    const respone = await hotelRepository.softDelete(id);
    return respone;
}

