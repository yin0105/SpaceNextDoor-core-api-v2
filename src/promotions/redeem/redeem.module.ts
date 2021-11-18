import { Logger, Module } from '@nestjs/common';

import { DbModule } from '../../db/db.module';
import { promotionRedeemProviders } from './redeem.provider';
import { PromotionRedeemService } from './redeem.service';

@Module({
  imports: [DbModule],
  providers: [Logger, ...promotionRedeemProviders, PromotionRedeemService],
  exports: [PromotionRedeemService, ...promotionRedeemProviders],
})
export class PromotionRedeemModule {}
