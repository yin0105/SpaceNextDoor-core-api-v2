import { Inject, Injectable, Logger } from '@nestjs/common';
import { WhereOptions } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

import {
  FeatureCategoryFilter,
  FeatureCategoryResp,
  FeatureCategorySort,
  Pagination,
  PlatformFeatureCategory,
} from '../../../graphql.schema';
import { hasMoreRec, initPagination } from '../../../shared/utils';
import {
  toSequelizeComparator,
  toSequelizeSort,
} from '../../../shared/utils/graphql-to-sequelize-comparator';
import { PlatformFeatureModel } from '../feature.model';
import {
  PLATFORM_FEATURE_CATEGORY_REPOSITORY,
  SEQUELIZE_PROVIDER,
} from './../../../shared/constant/app.constant';
import { PlatformFeatureCategoryModel } from './feature-category.model';

@Injectable()
export class PlatformFeatureCategoryService {
  constructor(
    @Inject(SEQUELIZE_PROVIDER)
    private readonly sequelize: Sequelize,
    @Inject(PLATFORM_FEATURE_CATEGORY_REPOSITORY)
    private readonly featureCategoryModel: typeof PlatformFeatureCategoryModel,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(PlatformFeatureCategoryService.name);
  }

  async getAll(
    pagination: Pagination,
    sort: FeatureCategorySort,
    where?: FeatureCategoryFilter,
  ): Promise<FeatureCategoryResp> {
    this.logger.setContext(PlatformFeatureCategoryService.name);

    pagination = initPagination(pagination);
    const include = [];
    const whereFilter: WhereOptions = toSequelizeComparator({
      type: where?.type,
      is_active: where?.is_active,
    });

    include.push({ model: PlatformFeatureModel, where: whereFilter });
    const { count, rows } = await this.featureCategoryModel.findAndCountAll({
      include,
      limit: pagination.limit,
      offset: pagination.skip,
      order: toSequelizeSort(sort),
    });

    const result = new FeatureCategoryResp();
    result.edges = (rows as undefined) as PlatformFeatureCategory[];
    result.page_info = {
      ...pagination,
      total: count,
      has_more: hasMoreRec(count, pagination),
    };

    return result;
  }
}
