import { BOOKING_REPOSITORY } from '../shared/constant/app.constant';
import { BookingModel } from './booking.model';

export const bookingProvider = [
  {
    provide: BOOKING_REPOSITORY,
    useValue: BookingModel,
  },
];
