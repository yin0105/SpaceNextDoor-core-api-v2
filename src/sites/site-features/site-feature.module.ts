import { Logger, Module } from '@nestjs/common';

import { DbModule } from '../../db/db.module';
import { siteFeatureProvider } from './site-feature.provider';
import { SiteFeatureService } from './site-feature.service';

@Module({
  imports: [DbModule],
  providers: [...siteFeatureProvider, SiteFeatureService, Logger],
  exports: [SiteFeatureService, ...siteFeatureProvider],
})
export class SiteFeatureModule {}
