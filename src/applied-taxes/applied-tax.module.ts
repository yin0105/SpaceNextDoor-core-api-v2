import { Logger, Module } from '@nestjs/common';

import { DbModule } from '../db/db.module';
import { PlatformTaxModule } from '../platform/taxes/tax.module';
import { AppliedTaxService } from './applied-tax.service';

@Module({
  imports: [DbModule, PlatformTaxModule],
  providers: [AppliedTaxService, Logger],
  exports: [AppliedTaxService],
})
export class AppliedTaxModule {}
