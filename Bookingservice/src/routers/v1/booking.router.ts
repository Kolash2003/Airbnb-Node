import express from 'express';
import { validateQueryParams, validateRequestBody } from '../../validators';
import { bookingListQuerySchema, createBookingSchema } from '../../validators/booking.validator';
import { confirmBookingHandler, createBookingHandler, listBookingsHandler } from '../../controllers/booking.controller';

const bookingRouter = express.Router();

bookingRouter.get('/', validateQueryParams(bookingListQuerySchema), listBookingsHandler);
bookingRouter.post('/', validateRequestBody(createBookingSchema), createBookingHandler);
bookingRouter.post('/confirm/:idempotencyKey', confirmBookingHandler);

export default bookingRouter;