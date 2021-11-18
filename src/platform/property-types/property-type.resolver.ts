import { Logger } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import {
  Pagination,
  PropertyTypeResp,
  PropertyTypeSort,
  SortBy,
} from '../../graphql.schema';
import { PropertyTypeService } from './property-type.service';

@Resolver('PropertyType')
export class PropertyTypeResolver {
  constructor(
    private readonly propertyTypeService: PropertyTypeService,
    private readonly logger: Logger,
  ) {}

  @Query('property_types')
  async propertyTypes(
    @Args('pagination') pagination: Pagination,
    @Args('sort_by') sortBy: PropertyTypeSort = { name_en: SortBy.asc },
  ): Promise<PropertyTypeResp> {
    return await this.propertyTypeService.getAll(pagination, sortBy);
  }
}
