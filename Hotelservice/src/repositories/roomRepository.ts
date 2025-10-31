import Room from "../db/models/room";
import BaseRepository from "./base.repository";


class RoomRepository extends BaseRepository<Room> {
    constructor() {
        super(Room)
    }

    async findByRoomCategoryIdAndDate(roomCategoryId: number, currentDate: Date) {
        return await this.model.findOne({
            where: {
                roomCategoryId: roomCategoryId,
                dateofAvailability: currentDate,
                deletedAt: null,
            }
        })
    }
}

export default RoomRepository;