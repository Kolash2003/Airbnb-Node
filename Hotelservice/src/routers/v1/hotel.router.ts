import express from 'express';
import { createHotelHandler, deleteHotelHandler, getAllHotelsHandler, getHotelByIdHandler } from '../../controllers/hotel.controller';
import { validateRequestBody } from '../../validators';
import { hotelSchema } from '../../validators/hotel.validator';

const hotelRouter = express.Router();

hotelRouter.post('/', validateRequestBody(hotelSchema) ,createHotelHandler); // TODO: Resolve this TS compilation issue
hotelRouter.get('/:id', getHotelByIdHandler);
hotelRouter.delete('/:id', deleteHotelHandler);
hotelRouter.get('/', getAllHotelsHandler);

export default hotelRouter;