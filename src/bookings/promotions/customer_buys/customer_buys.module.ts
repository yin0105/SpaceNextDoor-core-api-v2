import { Logger, Module } from '@nestjs/common';

import { DbModule } from '../../../db/db.module';
import { bookingPromotionCustomerBuysProviders } from './customer_buys.provider';
import { BookingPromotionCustomerBuysService } from './customer_buys.service';

@Module({
  imports: [DbModule],
  providers: [
    ...bookingPromotionCustomerBuysProviders,
    BookingPromotionCustomerBuysService,
    Logger,
  ],
  exports: [
    BookingPromotionCustomerBuysService,
    ...bookingPromotionCustomerBuysProviders,
  ],
})
export class BookingPromotionCustomerBuysModule {}
