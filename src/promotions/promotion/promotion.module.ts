import { Logger, Module } from '@nestjs/common';

import { DbModule } from '../../db/db.module';
import { SiteModule } from '../../sites/sites/site.module';
import { spaceProvider } from '../../spaces/spaces/space.provider';
import { PromotionCustomerBuysModule } from '../customer_buys/customer_buys.module';
import { PromotionCustomerGetsModule } from '../customer_gets/customer_gets.module';
import { promotionRedeemProviders } from '../redeem/redeem.provider';
import { PromotionRedeemService } from '../redeem/redeem.service';
import { promotionProviders } from './promotion.provider';
import { PromotionResolver } from './promotion.resolver';
import { PromotionService } from './promotion.service';

@Module({
  imports: [
    DbModule,
    PromotionCustomerBuysModule,
    PromotionCustomerGetsModule,
    SiteModule,
  ],
  providers: [
    ...promotionProviders,
    ...spaceProvider,
    ...promotionRedeemProviders,
    PromotionResolver,
    PromotionService,
    PromotionRedeemService,
    Logger,
  ],
  exports: [PromotionService, ...promotionProviders],
})
export class PromotionModule {}
