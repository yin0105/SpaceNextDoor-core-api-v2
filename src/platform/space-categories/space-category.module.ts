import { Logger, Module } from '@nestjs/common';

import { DbModule } from '../../db/db.module';
import { platformSpaceCategoryItemProvider } from './items/space-category-item.provider';
import { PlatformSpaceCategoryItemService } from './items/space-category-item.service';
import { platformSpaceCategoryProvider } from './space-category.provider';
import { PlatformSpaceCategoryResolver } from './space-category.resolver';
import { PlatformSpaceCategoryService } from './space-category.service';

@Module({
  imports: [DbModule],
  providers: [
    ...platformSpaceCategoryProvider,
    ...platformSpaceCategoryItemProvider,
    PlatformSpaceCategoryService,
    PlatformSpaceCategoryResolver,
    PlatformSpaceCategoryItemService,
    Logger,
  ],
  exports: [PlatformSpaceCategoryService],
})
export class PlatformSpaceCategoryModule {}
