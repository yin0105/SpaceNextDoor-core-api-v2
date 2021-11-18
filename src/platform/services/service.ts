import { Inject, Injectable, Logger } from '@nestjs/common';

import { CountryModel } from '../../countries/country.model';
import {
  Pagination,
  PlatformService,
  ServiceFilter,
  ServicesResp,
  ServiceStatus,
  ServiceType,
} from '../../graphql.schema';
import { PLATFORM_SERVICE_REPOSITORY } from '../../shared/constant/app.constant';
import { hasMoreRec, initPagination } from '../../shared/utils';
import { toSequelizeComparator } from '../../shared/utils/graphql-to-sequelize-comparator';
import { PlatformServiceModel } from './service.model';

@Injectable()
export class Service {
  constructor(
    @Inject(PLATFORM_SERVICE_REPOSITORY)
    private readonly serviceEntity: typeof PlatformServiceModel,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(Service.name);
  }

  async getById(id: number): Promise<PlatformService> {
    const result = await this.serviceEntity.findByPk(id);

    return (result as undefined) as PlatformService;
  }

  async getByIdAndType(
    id: number,
    type: ServiceType,
  ): Promise<PlatformService> {
    const result = await this.serviceEntity.findOne({
      where: { id, type, status: ServiceStatus.ACTIVE },
      include: [{ model: CountryModel }],
    });

    return (result as undefined) as PlatformService;
  }

  async findAll(
    pagination: Pagination,
    whereFilter?: ServiceFilter,
  ): Promise<ServicesResp> {
    pagination = initPagination(pagination);
    const include = [];
    // make country name from filter indexable
    if (whereFilter?.country) {
      const filter = {
        name_en: whereFilter.country,
      };

      include.push({
        model: CountryModel,
        where: toSequelizeComparator(filter),
      });
      delete whereFilter.country;
    }

    const { count, rows } = await this.serviceEntity.findAndCountAll({
      where: toSequelizeComparator(whereFilter),
      include,
      limit: pagination.limit,
      offset: pagination.skip,
    });

    const result = new ServicesResp();
    const edges = (rows as undefined) as PlatformService[];

    result.edges = edges;
    result.page_info = {
      ...pagination,
      total: count,
      has_more: hasMoreRec(count, pagination),
    };

    return result;
  }
}
