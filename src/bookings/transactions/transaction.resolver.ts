import { Logger } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { Auth, AuthUser, IAuthUser } from '../../auth/auth.decorators';
import { UserRoles } from '../../auth/users/interfaces/user.interface';
import {
  Pagination,
  TransactionsFilter,
  TransactionsResp,
} from '../../graphql.schema';
import { TransactionService } from './transaction.service';

@Resolver('Transaction')
export class TransactionResolver {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(TransactionResolver.name);
  }

  @Auth(UserRoles.CUSTOMER)
  @Query('transactions')
  async transaction(
    @AuthUser() user: IAuthUser,
    @Args('pagination') pagination: Pagination,
    @Args('where') where: TransactionsFilter = {},
  ): Promise<TransactionsResp> {
    return await this.transactionService.getAll(pagination, where, {
      user_id: user?.user_id,
    });
  }
}
