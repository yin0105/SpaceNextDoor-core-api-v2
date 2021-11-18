import { Inject, Injectable, Logger } from '@nestjs/common';
import { WhereOptions } from 'sequelize';

import {
  BanksFilter,
  BanksResp,
  BanksSort,
  Pagination,
  PlatformBank,
} from '../../graphql.schema';
import { PLATFORM_BANK_REPOSITORY } from '../../shared/constant/app.constant';
import { hasMoreRec, initPagination } from '../../shared/utils';
import {
  toSequelizeComparator,
  toSequelizeSort,
} from '../../shared/utils/graphql-to-sequelize-comparator';
import { PlatformBankModel } from './bank.model';

@Injectable()
export class BankService {
  constructor(
    @Inject(PLATFORM_BANK_REPOSITORY)
    private readonly bankEntity: typeof PlatformBankModel,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(BankService.name);
  }

  async findAll(
    pagination: Pagination,
    where: BanksFilter = {},
    sort: BanksSort = {},
  ): Promise<BanksResp> {
    this.logger.setContext(BankService.name);

    pagination = initPagination(pagination);
    const whereBanks: WhereOptions = toSequelizeComparator(where);

    const { count, rows } = await this.bankEntity.findAndCountAll({
      where: whereBanks,
      limit: pagination.limit,
      offset: pagination.skip,
      order: toSequelizeSort(sort),
    });

    const result = new BanksResp();
    result.edges = (rows as undefined) as PlatformBank[];
    result.page_info = {
      ...pagination,
      total: count,
      has_more: hasMoreRec(count, pagination),
    };

    return result;
  }
}
