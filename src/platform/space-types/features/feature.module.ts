import { Logger, Module } from '@nestjs/common';

import { DbModule } from '../../../db/db.module';
import { spaceTypeFeatureProvider } from './feature.provider';

@Module({
  imports: [DbModule],
  providers: [...spaceTypeFeatureProvider, Logger],
  exports: [...spaceTypeFeatureProvider],
})
export class SiteFeatureModule {}
