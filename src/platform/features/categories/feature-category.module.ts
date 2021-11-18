import { Logger, Module } from '@nestjs/common';

import { DbModule } from '../../../db/db.module';
import { platformFeatureProvider } from '../feature.provider';
import { PlatformFeatureService } from '../feature.service';
import { featureCategoryProvider } from './feature-category.provider';
import { PlatformFeatureCategoryResolver } from './feature-category.resolver';
import { PlatformFeatureCategoryService } from './feature-category.service';

@Module({
  imports: [DbModule],
  providers: [
    ...featureCategoryProvider,
    ...platformFeatureProvider,
    PlatformFeatureCategoryResolver,
    PlatformFeatureCategoryService,
    PlatformFeatureService,
    Logger,
  ],
  exports: [PlatformFeatureCategoryService],
})
export class PlatformFeatureCategoryModule {}
