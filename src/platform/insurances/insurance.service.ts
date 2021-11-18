import { Inject, Injectable, Logger } from '@nestjs/common';

import { CountryModel } from '../../countries/country.model';
import {
  InsuranceFilter,
  InsuranceSort,
  InsurancesResp,
  Pagination,
  PlatformInsurance,
} from '../../graphql.schema';
import { PLATFORM_INSURANCE_REPOSITORY } from '../../shared/constant/app.constant';
import { hasMoreRec, initPagination } from '../../shared/utils';
import {
  toSequelizeComparator,
  toSequelizeSort,
} from '../../shared/utils/graphql-to-sequelize-comparator';
import { PlatformInsuranceModel } from './insurance.model';

@Injectable()
export class InsuranceService {
  constructor(
    @Inject(PLATFORM_INSURANCE_REPOSITORY)
    private readonly insuranceEntity: typeof PlatformInsuranceModel,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(InsuranceService.name);
  }

  async getById(id: number): Promise<PlatformInsurance> {
    const result = await this.insuranceEntity.findByPk(id);

    return (result as undefined) as PlatformInsurance;
  }

  async findAll(
    pagination: Pagination,
    sort?: InsuranceSort,
    where?: InsuranceFilter,
  ): Promise<InsurancesResp> {
    pagination = initPagination(pagination);

    const include = [];
    // make country name from filter indexable
    if (where?.country) {
      const filter = {
        name_en: where.country,
      };

      include.push({
        model: CountryModel,
        where: toSequelizeComparator(filter),
      });
      delete where.country;
    }
    const { count, rows } = await this.insuranceEntity.findAndCountAll({
      include,
      where: toSequelizeComparator(where),
      limit: pagination.limit,
      offset: pagination.skip,
      order: toSequelizeSort(sort),
    });

    const result = new InsurancesResp();
    const edges = (rows as undefined) as PlatformInsurance[];

    result.edges = edges;
    result.page_info = {
      ...pagination,
      total: count,
      has_more: hasMoreRec(count, pagination),
    };

    return result;
  }
}
