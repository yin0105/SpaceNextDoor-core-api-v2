import { Inject, Injectable, Logger } from '@nestjs/common';
import { Op } from 'sequelize';

import { PlatformSpaceCategoryItem } from '../../../graphql.schema';
import { PLATFORM_SPACE_CATEGORY_ITEM_REPOSITORY } from '../../../shared/constant/app.constant';
import { PlatformSpaceCategoryItemModel } from './space-category-item.model';

@Injectable()
export class PlatformSpaceCategoryItemService {
  constructor(
    @Inject(PLATFORM_SPACE_CATEGORY_ITEM_REPOSITORY)
    private readonly spaceCategoryItemModel: typeof PlatformSpaceCategoryItemModel,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(PlatformSpaceCategoryItemService.name);
  }

  async getByCategoryId(id: number): Promise<PlatformSpaceCategoryItem[]> {
    const result = await this.spaceCategoryItemModel.findAll({
      where: {
        category_id: { [Op.eq]: id },
      },
    });
    return (result as undefined) as PlatformSpaceCategoryItem[];
  }
}
