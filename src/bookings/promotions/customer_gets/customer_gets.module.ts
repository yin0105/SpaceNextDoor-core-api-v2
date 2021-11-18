import { Logger, Module } from '@nestjs/common';

import { DbModule } from '../../../db/db.module';
import { bookingPromotionCustomerGetsProviders } from './customer_gets.provider';
import { BookingPromotionCustomerGetsService } from './customer_gets.service';

@Module({
  imports: [DbModule],
  providers: [
    ...bookingPromotionCustomerGetsProviders,
    BookingPromotionCustomerGetsService,
    Logger,
  ],
  exports: [
    BookingPromotionCustomerGetsService,
    ...bookingPromotionCustomerGetsProviders,
  ],
})
export class BookingPromotionCustomerGetsModule {}
