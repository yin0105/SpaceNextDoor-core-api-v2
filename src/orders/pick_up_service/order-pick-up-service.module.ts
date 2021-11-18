import { Logger, Module } from '@nestjs/common';

import { DbModule } from '../../db/db.module';
import { LogisticsModule } from '../../logistics/logistics.module';
import { PlatformServiceModule } from '../../platform/services/service.module';
import { orderPickUpServiceProvider } from './order-pick-up-service.provider';
import { OrderPickUpServiceResolver } from './order-pick-up-service.resolver';
import { OrderPickUpService } from './order-pick-up-service.service';
@Module({
  imports: [DbModule, PlatformServiceModule, LogisticsModule],
  providers: [
    OrderPickUpService,
    ...orderPickUpServiceProvider,
    OrderPickUpServiceResolver,
    Logger,
  ],
  exports: [OrderPickUpService],
})
export class OrderPickUpServiceModule {}
