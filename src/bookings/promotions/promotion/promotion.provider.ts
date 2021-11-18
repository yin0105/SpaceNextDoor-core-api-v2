import { BOOKING_PROMOTION_REPOSITORY } from '../../../shared/constant/app.constant';
import { BookingPromotionModel } from './promotion.model';

export const bookingPromotionProviders = [
  {
    provide: BOOKING_PROMOTION_REPOSITORY,
    useValue: BookingPromotionModel,
  },
];
