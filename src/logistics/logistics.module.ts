import { Logger, Module } from '@nestjs/common';

import { serviceProvider } from '../platform/services/service.provider';
import { platformSpaceTypeProvider } from '../platform/space-types/space-type.provider';
import { spaceProvider } from '../spaces/spaces/space.provider';
import { LogisticsResolver } from './logistics.resolver';
import { LogisticsService } from './logistics.service';
import { GoGoxLogisticsService } from './providers/gogox/gogox.logistics.service';

@Module({
  imports: [],
  providers: [
    LogisticsService,
    GoGoxLogisticsService,
    LogisticsResolver,
    ...serviceProvider,
    ...spaceProvider,
    ...platformSpaceTypeProvider,
    Logger,
  ],
  exports: [LogisticsService, GoGoxLogisticsService],
})
export class LogisticsModule {}
