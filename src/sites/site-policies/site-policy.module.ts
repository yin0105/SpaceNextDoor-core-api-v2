import { Logger, Module } from '@nestjs/common';

import { DbModule } from '../../db/db.module';
import { sitePolicyProvider } from './site-policy.provider';
import { SitePolicyService } from './site-policy.service';

@Module({
  imports: [DbModule],
  providers: [...sitePolicyProvider, SitePolicyService, Logger],
  exports: [SitePolicyService, ...sitePolicyProvider],
})
export class SitePolicyModule {}
