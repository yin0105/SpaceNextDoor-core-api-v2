import { BOOKING_PROMOTION_CUSTOMER_GETS_REPOSITORY } from '../../../shared/constant/app.constant';
import { BookingPromotionCustomerGetsModel } from './customer_gets.model';

export const bookingPromotionCustomerGetsProviders = [
  {
    provide: BOOKING_PROMOTION_CUSTOMER_GETS_REPOSITORY,
    useValue: BookingPromotionCustomerGetsModel,
  },
];
