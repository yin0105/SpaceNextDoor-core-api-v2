import { Logger, Module } from '@nestjs/common';

import { platformCommissionProvider } from './commission.provider';
import { CommissionService } from './commission.service';

@Module({
  imports: [],
  providers: [...platformCommissionProvider, CommissionService, Logger],
  exports: [CommissionService],
})
export class PlatformCommissionModule {}
