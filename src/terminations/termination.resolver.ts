import { Logger } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { Auth, AuthUser, IAuthUser } from '../auth/auth.decorators';
import { UserRoles } from '../auth/users/interfaces/user.interface';
import {
  CalculateTerminationDuesResp,
  PayTerminationPayload,
  PayTerminationResp,
  Termination,
  TerminationPayload,
} from '../graphql.schema';
import { TerminationService } from './termination.service';

@Resolver('Termination')
export class TerminationResolver {
  constructor(
    private readonly terminationService: TerminationService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(TerminationResolver.name);
  }

  @Auth(UserRoles.CUSTOMER)
  @Mutation('calculateTerminationDues')
  async calculateTerminationDues(
    @AuthUser() user: IAuthUser,
    @Args('payload') payload: TerminationPayload,
  ): Promise<CalculateTerminationDuesResp> {
    return await this.terminationService.calculateTerminationDues(payload, {
      user_id: user.user_id,
    });
  }

  @Auth(UserRoles.CUSTOMER)
  @Mutation('requestTermination')
  async requestTermination(
    @AuthUser() user: IAuthUser,
    @Args('payload') payload: TerminationPayload,
  ): Promise<Termination> {
    return await this.terminationService.requestTermination(payload, {
      user_id: user.user_id,
    });
  }

  @Auth(UserRoles.CUSTOMER)
  @Mutation('payTerminationAmount')
  async payTerminationAmount(
    @Args('payload') payload: PayTerminationPayload,
  ): Promise<PayTerminationResp> {
    return await this.terminationService.payTerminationDues(payload);
  }
}
