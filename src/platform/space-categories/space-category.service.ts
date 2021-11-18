import { Inject, Injectable, Logger } from '@nestjs/common';

import {
  Pagination,
  PlatformSpaceCategory,
  PlatformSpaceCategoryResp,
} from '../../graphql.schema';
import { PLATFORM_SPACE_CATEGORY_REPOSITORY } from '../../shared/constant/app.constant';
import { hasMoreRec, initPagination } from '../../shared/utils';
import { PlatformSpaceCategoryItemModel } from './items/space-category-item.model';
import { PlatformSpaceCategoryModel } from './space-category.model';

@Injectable()
export class PlatformSpaceCategoryService {
  constructor(
    @Inject(PLATFORM_SPACE_CATEGORY_REPOSITORY)
    private readonly spaceCategoryEntity: typeof PlatformSpaceCategoryModel,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(PlatformSpaceCategoryService.name);
  }

  async getById(id: number): Promise<PlatformSpaceCategory> {
    const result = await this.spaceCategoryEntity.findByPk(id);
    return (result as undefined) as PlatformSpaceCategory;
  }

  async findAll(pagination: Pagination): Promise<PlatformSpaceCategoryResp> {
    pagination = initPagination(pagination);
    const { count, rows } = await this.spaceCategoryEntity.findAndCountAll({
      limit: pagination.limit,
      offset: pagination.skip,
      include: [{ model: PlatformSpaceCategoryItemModel }],
    });

    const result = new PlatformSpaceCategoryResp();
    const edges = (rows as undefined) as PlatformSpaceCategory[];

    result.edges = edges;
    result.page_info = {
      ...pagination,
      total: count,
      has_more: hasMoreRec(count, pagination),
    };

    return result;
  }
}
