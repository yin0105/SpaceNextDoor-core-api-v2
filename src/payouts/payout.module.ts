import { Logger, Module } from '@nestjs/common';

import { payoutProvider } from './payout.provider';
import { PayoutResolver } from './payout.resolver';
import { PayoutService } from './payout.service';

@Module({
  imports: [],
  providers: [PayoutService, ...payoutProvider, PayoutResolver, Logger],
  exports: [PayoutService],
})
export class PayoutModule {}
