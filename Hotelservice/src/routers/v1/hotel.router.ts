import express from 'express';
import { createHotelHandler, createReviewHandler, deleteHotelHandler, getAllHotelsHandler, getHotelByIdHandler, listReviewsHandler, updateHotelHandler } from '../../controllers/hotel.controller';
import { validateQueryParams, validateRequestBody } from '../../validators';
import { hotelSchema, hotelSearchQuerySchema, hotelUpdateSchema, reviewSchema } from '../../validators/hotel.validator';
import { requireAdmin, requireAuth } from '../../middlewares/auth.middleware';

const hotelRouter = express.Router();

hotelRouter.post('/', requireAuth, requireAdmin, validateRequestBody(hotelSchema), createHotelHandler);
hotelRouter.get('/:id', getHotelByIdHandler);
hotelRouter.patch('/:id', requireAuth, requireAdmin, validateRequestBody(hotelUpdateSchema), updateHotelHandler);
hotelRouter.delete('/:id', requireAuth, requireAdmin, deleteHotelHandler);
hotelRouter.get('/', validateQueryParams(hotelSearchQuerySchema), getAllHotelsHandler);

hotelRouter.get('/:id/reviews', listReviewsHandler);
hotelRouter.post('/:id/reviews', requireAuth, validateRequestBody(reviewSchema), createReviewHandler);

export default hotelRouter;
