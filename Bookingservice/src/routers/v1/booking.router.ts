import express from 'express';
import { validateRequestBody } from '../../validators';
import { createBookingSchema } from '../../validators/booking.validator';
import { cancelBookingHandler, confirmBookingHandler, createBookingHandler, listBookingsHandler } from '../../controllers/booking.controller';
import { requireAuth } from '../../middlewares/auth.middleware';

const bookingRouter = express.Router();

// Every booking route acts on the signed-in user taken from the JWT.
bookingRouter.use(requireAuth);

bookingRouter.get('/', listBookingsHandler);
bookingRouter.post('/', validateRequestBody(createBookingSchema), createBookingHandler);
bookingRouter.post('/confirm/:idempotencyKey', confirmBookingHandler);
bookingRouter.post('/:id/cancel', cancelBookingHandler);

export default bookingRouter;
