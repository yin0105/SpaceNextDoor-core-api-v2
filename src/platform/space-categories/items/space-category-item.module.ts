import { Logger, Module } from '@nestjs/common';

import { DbModule } from '../../../db/db.module';
import { platformSpaceCategoryItemProvider } from './space-category-item.provider';
import { PlatformSpaceCategoryItemService } from './space-category-item.service';

@Module({
  imports: [DbModule],
  providers: [
    ...platformSpaceCategoryItemProvider,
    PlatformSpaceCategoryItemService,
    Logger,
  ],
  exports: [PlatformSpaceCategoryItemService],
})
export class PlatformSpaceCategoryItemModule {}
