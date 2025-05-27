import { createHotelDTO } from "../dto/hotel.dto";
import { createHotel, getAllHotels, getHotelById } from "../repositories/hotel.repository";

export async function createHotelservice(hotelData: createHotelDTO) {
    const hotel = await createHotel(hotelData);
    return hotel;
}

export async function getHotelByIdService(id: number) {
    const hotel = await getHotelById(id);
    return hotel;
}

export async function getAllHotelsService() {
    const hotelResponse = await getAllHotels();
    return hotelResponse;
}

