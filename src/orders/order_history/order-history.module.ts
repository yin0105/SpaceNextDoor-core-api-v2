import { Logger, Module } from '@nestjs/common';

import { DbModule } from '../../db/db.module';
import { orderHistoryProvider } from './order-history.provider';
import { OrderHistoryService } from './order-history.service';

@Module({
  imports: [DbModule],
  providers: [...orderHistoryProvider, OrderHistoryService, Logger],
  exports: [OrderHistoryService],
})
export class OrderHistoryModule {}
