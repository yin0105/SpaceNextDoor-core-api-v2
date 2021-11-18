import { Logger, Module } from '@nestjs/common';

import { DbModule } from '../../db/db.module';
import { promotionCustomerGetsProviders } from './customer_gets.provider';
import { PromotionCustomerGetsService } from './customer_gets.service';

@Module({
  imports: [DbModule],
  providers: [
    ...promotionCustomerGetsProviders,
    PromotionCustomerGetsService,
    Logger,
  ],
  exports: [PromotionCustomerGetsService],
})
export class PromotionCustomerGetsModule {}
