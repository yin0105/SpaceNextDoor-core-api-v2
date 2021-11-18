import { Logger } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { LogisticsPricePayload, LogisticsPriceResp } from '../graphql.schema';
import { LogisticsService } from './logistics.service';
import { GoGoxLogisticsService } from './providers/gogox/gogox.logistics.service';

@Resolver('Logistics')
export class LogisticsResolver {
  constructor(
    private readonly goGoxLogisticsService: GoGoxLogisticsService,
    private readonly logisticsService: LogisticsService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(LogisticsResolver.name);
  }

  @Mutation('calculateLogisticsPrice')
  async calculateLogisticsPrice(
    @Args('payload') payload: LogisticsPricePayload,
  ): Promise<LogisticsPriceResp> {
    // TODO: we'll pass first param based on users country later on if we have multiple providers in different countries
    return this.logisticsService.getPrice(this.goGoxLogisticsService, payload);
  }
}
