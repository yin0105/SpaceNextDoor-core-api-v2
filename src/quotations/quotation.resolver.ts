import { Logger } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { QuotationPayload, QuotationResp } from '../graphql.schema';
import { QuotationService } from './quotation.service';

@Resolver('Quotation')
export class QuotationResolver {
  constructor(
    private readonly logger: Logger,
    private readonly quotationService: QuotationService,
  ) {
    this.logger.setContext(QuotationResolver.name);
  }

  @Mutation('createQuotation')
  async createQuotation(
    @Args('payload') payload: QuotationPayload,
  ): Promise<QuotationResp> {
    return this.quotationService.createQuotation(payload);
  }
}
