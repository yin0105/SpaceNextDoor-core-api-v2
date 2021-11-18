/* eslint-disable complexity */
import { Logger } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { Auth } from '../auth/auth.decorators';
import { UserRoles } from '../auth/users/interfaces/user.interface';
import {
  UpdatePayoutFilter,
  UpdatePayoutPayload,
  UpdatePayoutResp,
} from '../graphql.schema';
import { PayoutService } from './payout.service';
@Resolver('Payout')
export class PayoutResolver {
  constructor(
    private readonly payoutService: PayoutService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(PayoutResolver.name);
  }

  @Auth(UserRoles.ADMIN)
  @Mutation('updatePayout')
  async updateBooking(
    @Args('payload') payload: UpdatePayoutPayload,
    @Args('where') where: UpdatePayoutFilter,
  ): Promise<UpdatePayoutResp> {
    return await this.payoutService.update(payload, where);
  }
}
