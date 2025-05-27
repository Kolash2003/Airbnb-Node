import express from 'express';
import { createHotelHandler, deleteHotelHandler, getHotelByIdHandler } from '../../controllers/hotel.controller';
import { validateRequestBody } from '../../validators';
import { hotelDeleteSchema, hotelSchema } from '../../validators/hotel.validator';

const hotelRouter = express.Router();

hotelRouter.post('/', validateRequestBody(hotelSchema) ,createHotelHandler); // TODO: Resolve this TS compilation issue
hotelRouter.get('/:id', getHotelByIdHandler);
hotelRouter.delete('/delete', validateRequestBody(hotelDeleteSchema), deleteHotelHandler);

export default hotelRouter;