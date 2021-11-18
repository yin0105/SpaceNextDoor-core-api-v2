import { Logger, Module } from '@nestjs/common';

import { DbModule } from '../../db/db.module';
import { promotionCustomerBuysProviders } from './customer_buys.provider';
import { PromotionCustomerBuysService } from './customer_buys.service';

@Module({
  imports: [DbModule],
  providers: [
    ...promotionCustomerBuysProviders,
    PromotionCustomerBuysService,
    Logger,
  ],
  exports: [PromotionCustomerBuysService, ...promotionCustomerBuysProviders],
})
export class PromotionCustomerBuysModule {}
