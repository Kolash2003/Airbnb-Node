import { create } from "domain";
import RoomCategory from "../db/models/roomCategory";
import { RoomGenerationJob } from "../dto/roomGeneration.dto";
import RoomCategoryRepository from "../repositories/roomCategory.repository"
import RoomRepository from "../repositories/roomRepository";
import { BadRequestError, NotFoundError } from "../utils/errors/app.error";

const roomCategoryRepository = new RoomCategoryRepository();
const roomRepository = new RoomRepository();
export async function generateRooms(jobData: RoomGenerationJob) {
    

    const roomCategory = await roomCategoryRepository.findById(jobData.roomCategoryId);

    if (!roomCategory) {
        throw new NotFoundError(`Room category with id ${jobData.roomCategoryId} not found`);
    }

    const startDate = new Date(jobData.startDate);
    const endDate = new Date(jobData.endDate);

    if (startDate >= endDate) {
        throw new BadRequestError('Start date must be before end date');
    }

    if (startDate < new Date()) {
        throw new BadRequestError('Start date must be in the future');
    }

    const totalDays = Math.ceil(endDate.getTime() - startDate.getTime() / (1000*60*60*24));



    

}


export async function processDateBatch(roomCategory: RoomCategory, startDate: Date, endDate: Date, priceOverride?: number) {
    let roomsCreated = 0;
    let datesProcessed = 0;
    const roomsToCreate: any[] = [];

    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const existingRoom = await roomRepository.findByRoomCategoryIdAndDate(roomCategory.id, currentDate);

        if (!existingRoom) {
            roomsToCreate.push({
                hotelId: roomCategory.hotelId,
                roomCategoryId: roomCategory.id,
                dateofAvailability: currentDate,
                price: priceOverride || roomCategory.price,
            })
        }

        currentDate.setDate(currentDate.getDate() + 1);
        datesProcessed++;

    }

}

