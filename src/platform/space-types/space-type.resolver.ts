/* eslint-disable complexity */
import { Logger } from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import {
  Pagination,
  PlatformFeature,
  PlatformSpaceType,
  PlatformSpaceTypeResp,
  SitesSpacesSort,
  SpacesByTypeFilter,
  SpacesResp,
  SpaceTypesFilter,
} from '../../graphql.schema';
import { SpaceService } from '../../spaces/spaces/space.service';
import { PlatformSpaceTypeService } from './space-type.service';

@Resolver('PlatformSpaceType')
export class PlatformSpaceTypeResolver {
  constructor(
    private readonly spaceTypeService: PlatformSpaceTypeService,
    private readonly spaceService: SpaceService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(PlatformSpaceTypeResolver.name);
  }

  @Query('space_types')
  async spaceTypes(
    @Args('pagination') pagination: Pagination,
    @Args('where') where: SpaceTypesFilter,
  ): Promise<PlatformSpaceTypeResp> {
    return await this.spaceTypeService.findAll(pagination, where);
  }

  @ResolveField('spaces')
  async spaces(
    @Parent() spaceType: PlatformSpaceType,
    @Args('where') where: SpacesByTypeFilter,
    @Args('sort_by') sortBy: SitesSpacesSort,
  ): Promise<SpacesResp> {
    return this.spaceService.findAvailableSpaces(spaceType.id, where, sortBy);
  }
  @ResolveField('features')
  async features(
    @Parent() spaceType: PlatformSpaceType,
  ): Promise<PlatformFeature[]> {
    return this.spaceTypeService.getFeatures(spaceType.id);
  }
}
