import express from 'express';
import { RoomGenerationJobSchema } from '../../dto/roomGeneration.dto';
import { validateRequestBody } from '../../validators';
import { generateRoomsFromJob } from '../../controllers/roomCreation.controller';
import { requireAdmin, requireAuth } from '../../middlewares/auth.middleware';

const roomGenerationRouter = express.Router();

roomGenerationRouter.post('/', requireAuth, requireAdmin, validateRequestBody(RoomGenerationJobSchema), generateRoomsFromJob);


export default roomGenerationRouter;