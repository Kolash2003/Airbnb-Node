import express from 'express';
import { RoomGenerationJobSchema } from '../../dto/roomGeneration.dto';
import { validateRequestBody } from '../../validators';
import { generateRoomsFromJob } from '../../controllers/roomCreation.controller';

const roomGenerationRouter = express.Router();

roomGenerationRouter.post('/', validateRequestBody(RoomGenerationJobSchema), generateRoomsFromJob);


export default roomGenerationRouter;