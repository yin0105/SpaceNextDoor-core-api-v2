import { Logger, Module } from '@nestjs/common';

import { DbModule } from '../../../db/db.module';
import { PromotionModule } from '../../../promotions/promotion/promotion.module';
import { BookingPromotionCustomerBuysModule } from '../customer_buys/customer_buys.module';
import { BookingPromotionCustomerGetsModule } from '../customer_gets/customer_gets.module';
import { bookingPromotionProviders } from './promotion.provider';
import { BookingPromotionService } from './promotion.service';

@Module({
  imports: [
    DbModule,
    PromotionModule,
    BookingPromotionCustomerBuysModule,
    BookingPromotionCustomerGetsModule,
  ],
  providers: [...bookingPromotionProviders, BookingPromotionService, Logger],
  exports: [BookingPromotionService, ...bookingPromotionProviders],
})
export class BookingPromotionModule {}
