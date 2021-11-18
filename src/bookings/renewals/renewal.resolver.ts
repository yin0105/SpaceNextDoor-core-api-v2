import { Logger } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import {
  PaymentSchedulePayload,
  PaymentScheduleResp,
} from '../../graphql.schema';
import { RenewalService } from './../renewals/renewal.service';

@Resolver('Renewal')
export class RenewalResolver {
  constructor(
    private readonly renewalService: RenewalService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(RenewalResolver.name);
  }

  @Mutation('paymentSchedule')
  async paymentSchedule(
    @Args('payload') payload: PaymentSchedulePayload,
  ): Promise<PaymentScheduleResp[]> {
    return await this.renewalService.paymentSchedule(null, payload);
  }
}
