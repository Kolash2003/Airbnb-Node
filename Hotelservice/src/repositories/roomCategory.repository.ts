import logger from "../config/logger.config";
import RoomCategory from "../db/models/roomCategory";
import BaseRepository from "./base.repository";

class RoomCategoryRepository extends BaseRepository<RoomCategory> {
    constructor() {
        super(RoomCategory)
    }

    async findAllByHotelid(hotelId: number) {
        const roomCategory = await this.model.findAll({
            where: {
                deletedAt: null,
            }
        });

        if(!roomCategory || roomCategory.length === 0) {
            logger.error(`No Room categories found`);
        }

        return roomCategory;
    }

}

export default RoomCategoryRepository;