import { Logger } from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import {
  Pagination,
  PlatformSpaceCategory,
  PlatformSpaceCategoryItem,
  PlatformSpaceCategoryResp,
} from '../../graphql.schema';
import { PlatformSpaceCategoryItemService } from './items/space-category-item.service';
import { PlatformSpaceCategoryService } from './space-category.service';

@Resolver('PlatformSpaceCategory')
export class PlatformSpaceCategoryResolver {
  constructor(
    private readonly spaceCategoryService: PlatformSpaceCategoryService,
    private readonly categoryItemsService: PlatformSpaceCategoryItemService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(PlatformSpaceCategoryResolver.name);
  }

  @Query('space_categories')
  async spaceCategories(
    @Args('pagination') pagination: Pagination,
  ): Promise<PlatformSpaceCategoryResp> {
    return await this.spaceCategoryService.findAll(pagination);
  }

  @ResolveField('items')
  async items(
    @Parent() category: PlatformSpaceCategory,
  ): Promise<PlatformSpaceCategoryItem[]> {
    if (category.items) {
      return category.items;
    }

    return await this.categoryItemsService.getByCategoryId(category.id);
  }
}
