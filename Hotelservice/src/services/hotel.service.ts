import { createHotelDTO } from "../dto/hotel.dto";
// import { createHotel, getAllHotels, getHotelById } from "../repositories/hotel.repository";
import { HotelRepository, HotelSearchParams } from "../repositories/hotel.repository";

const hotelRepository = new HotelRepository(); // create an object and use its methods

export async function createHotelservice(hotelData: createHotelDTO) {
    const hotel = await hotelRepository.create(hotelData);
    return hotel;
}

export async function getHotelByIdService(id: number) {
    const hotel = await hotelRepository.findById(id);
    return hotel;
}

export async function getAllHotelsService(searchParams?: HotelSearchParams) {
    const hasSearchParams = searchParams?.q || searchParams?.checkin || searchParams?.checkout || searchParams?.guests;

    if (hasSearchParams) {
        const hotelResponse = await hotelRepository.search(searchParams);
        return hotelResponse;
    }

    const hotelResponse = await hotelRepository.findAll();
    return hotelResponse;
}

export async function deleteHotelService(id: number) {
    const respone = await hotelRepository.softDelete(id);
    return respone;
}

