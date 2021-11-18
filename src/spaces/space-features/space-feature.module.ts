import { Logger, Module } from '@nestjs/common';

import { DbModule } from '../../db/db.module';
import { spaceFeatureProvider } from './space-feature.provider';
import { SpaceFeatureService } from './space-feature.service';

@Module({
  imports: [DbModule],
  providers: [...spaceFeatureProvider, SpaceFeatureService, Logger],
  exports: [SpaceFeatureService],
})
export class SpaceFeatureModule {}
