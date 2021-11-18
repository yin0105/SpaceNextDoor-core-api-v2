import { Logger } from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import {
  FeatureCategoryFilter,
  FeatureCategoryResp,
  FeatureCategorySort,
  Pagination,
  PlatformFeature,
  SortBy,
} from '../../../graphql.schema';
import { PlatformFeatureService } from '../feature.service';
import { PlatformFeatureCategoryModel } from './feature-category.model';
import { PlatformFeatureCategoryService } from './feature-category.service';

@Resolver('PlatformFeatureCategory')
export class PlatformFeatureCategoryResolver {
  constructor(
    private readonly featureCategoryService: PlatformFeatureCategoryService,
    private readonly featureService: PlatformFeatureService,
    private readonly logger: Logger,
  ) {}

  @Query('feature_categories')
  async categories(
    @Args('pagination') pagination: Pagination,
    @Args('where') where?: FeatureCategoryFilter,
    @Args('sort_by') sortBy: FeatureCategorySort = { name_en: SortBy.asc },
  ): Promise<FeatureCategoryResp> {
    return await this.featureCategoryService.getAll(pagination, sortBy, where);
  }

  @ResolveField('features')
  async features(
    @Parent() category: PlatformFeatureCategoryModel,
  ): Promise<PlatformFeature[]> {
    if (category.features) {
      return category.features as any;
    }
    return await this.featureService.getByCatId(category.id);
  }
}
