import { Inject, Injectable, Logger } from '@nestjs/common';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

import {
  Pagination,
  PropertyTypeResp,
  PropertyTypeSort,
} from '../../graphql.schema';
import { PlatformPropertyTypeModel } from '../../platform/property-types/property-type.model';
import {
  PLATFORM_PROPERTY_TYPE_REPOSITORY,
  SEQUELIZE_PROVIDER,
} from '../../shared/constant/app.constant';
import { hasMoreRec, initPagination } from '../../shared/utils';
import { toSequelizeSort } from '../../shared/utils/graphql-to-sequelize-comparator';
import { IGetPropertyTypeWhere } from './interfaces/property-type.interface';

@Injectable()
export class PropertyTypeService {
  constructor(
    @Inject(SEQUELIZE_PROVIDER)
    private readonly sequelize: Sequelize,
    @Inject(PLATFORM_PROPERTY_TYPE_REPOSITORY)
    private readonly propertyTypeEntity: typeof PlatformPropertyTypeModel,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(PropertyTypeService.name);
  }

  async getAll(
    pagination: Pagination,
    sort: PropertyTypeSort,
  ): Promise<PropertyTypeResp> {
    this.logger.setContext(PropertyTypeService.name);

    pagination = initPagination(pagination);

    const { count, rows } = await this.propertyTypeEntity.findAndCountAll({
      limit: pagination.limit,
      offset: pagination.skip,
      order: toSequelizeSort(sort),
    });

    const result = new PropertyTypeResp();
    result.edges = rows;
    result.page_info = {
      ...pagination,
      total: count,
      has_more: hasMoreRec(count, pagination),
    };

    return result;
  }

  async getOne(
    where: IGetPropertyTypeWhere,
  ): Promise<PropertyTypeResp['edges'][0]> {
    if (Object.keys(where).length === 0) {
      throw new Error('One of where params required');
    }

    return this.propertyTypeEntity.findOne({
      where: {
        name_en: {
          [Op.iLike]: where.name,
        },
      },
    });
  }
}
