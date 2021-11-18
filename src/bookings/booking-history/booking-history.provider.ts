import { BOOKING_HISTORY_REPOSITORY } from '../../shared/constant/app.constant';
import { BookingHistoryModel } from './booking-history.model';

export const bookingHistoryProvider = [
  {
    provide: BOOKING_HISTORY_REPOSITORY,
    useValue: BookingHistoryModel,
  },
];
