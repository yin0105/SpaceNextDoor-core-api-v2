import { Logger, Module } from '@nestjs/common';

import { DbModule } from '../../db/db.module';
import { platformFeatureProvider } from './feature.provider';
import { PlatformFeatureService } from './feature.service';

@Module({
  imports: [DbModule],
  providers: [...platformFeatureProvider, PlatformFeatureService, Logger],
  exports: [PlatformFeatureService, ...platformFeatureProvider],
})
export class PlatformFeatureModule {}
