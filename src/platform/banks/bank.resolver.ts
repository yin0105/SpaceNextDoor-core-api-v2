import { Logger } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { Auth } from '../../auth/auth.decorators';
import { UserRoles } from '../../auth/users/interfaces/user.interface';
import {
  BanksFilter,
  BanksResp,
  BanksSort,
  Pagination,
} from '../../graphql.schema';
import { BankService } from './bank.service';

@Resolver('PlatformBank')
export class BankResolver {
  constructor(
    private readonly bankService: BankService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(BankResolver.name);
  }

  @Auth(UserRoles.PROVIDER, UserRoles.CUSTOMER, UserRoles.ADMIN)
  @Query('banks')
  async banks(
    @Args('pagination') pagination: Pagination,
    @Args('where') where: BanksFilter = {},
    @Args('sort') sort: BanksSort,
  ): Promise<BanksResp> {
    return await this.bankService.findAll(pagination, where, sort);
  }
}
