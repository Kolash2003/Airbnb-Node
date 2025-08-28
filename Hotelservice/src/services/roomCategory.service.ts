import logger from "../config/logger.config";
import { CreateRoomCategoryDTO } from "../dto/roomCategory.dto";
import { HotelRepository } from "../repositories/hotel.repository";
import { NotFoundError } from "../utils/errors/app.error";
import roomCategoryRepository from "../repositories/roomCategory.repository";

const roomcategoryRepository = new roomCategoryRepository();
const hotelRepository = new HotelRepository();

export async function CreateRoomCategoryService(roomCategoryData: CreateRoomCategoryDTO) {
    const roomCategory = roomcategoryRepository.create(roomCategoryData);
    return roomCategory;
}

export async function GetRoomCategoryById(id: number) {
    const roomCategory = await roomcategoryRepository.findById(id);
    if(!roomCategory) {
        logger.error(`Room category with id ${id} not found`);
    }
}

export async function GetAllRoomCategoriesByHotelIdService(Hotelid: number) {
    const hotel = await hotelRepository.findById(Hotelid);

    if(!hotel) {
        throw new NotFoundError(`Hotel with id ${Hotelid} not found`);
    }

    const roomCategories = await roomcategoryRepository.findAllByHotelid(Hotelid);

    return roomCategories;

}

export async function deleteRoomCategoryService(id: number) {
    const roomCategory = await roomcategoryRepository.findById(id);

    if(!roomCategory) {
        throw new NotFoundError(`Room category with id ${id} not found`);
    }

    await roomcategoryRepository.delete({id: id});
    return true;
}