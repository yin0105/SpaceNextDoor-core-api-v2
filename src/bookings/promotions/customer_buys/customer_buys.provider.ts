import { BOOKING_PROMOTION_CUSTOMER_BUYS_REPOSITORY } from '../../../shared/constant/app.constant';
import { BookingPromotionCustomerBuysModel } from './customer_buys.model';

export const bookingPromotionCustomerBuysProviders = [
  {
    provide: BOOKING_PROMOTION_CUSTOMER_BUYS_REPOSITORY,
    useValue: BookingPromotionCustomerBuysModel,
  },
];
