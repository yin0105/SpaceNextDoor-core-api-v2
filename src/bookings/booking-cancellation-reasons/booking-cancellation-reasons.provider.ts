import { CANCELLATION_REASONS_REPOSITORY } from '../../shared/constant/app.constant';
import { BookingCancellationReasonsModel } from './booking-cancellation-reasons.model';

export const bookingCancellationReasonsProvider = [
  {
    provide: CANCELLATION_REASONS_REPOSITORY,
    useValue: BookingCancellationReasonsModel,
  },
];
