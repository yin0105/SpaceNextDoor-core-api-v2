import { Inject, Injectable, Logger } from '@nestjs/common';
import { Transaction } from 'sequelize';

import { CustomerGetsInput } from '../../../graphql.schema';
import { BOOKING_PROMOTION_CUSTOMER_GETS_REPOSITORY } from '../../../shared/constant/app.constant';
import { BookingPromotionCustomerGetsModel } from './customer_gets.model';

@Injectable()
export class BookingPromotionCustomerGetsService {
  constructor(
    @Inject(BOOKING_PROMOTION_CUSTOMER_GETS_REPOSITORY)
    private readonly customerGetsEntity: typeof BookingPromotionCustomerGetsModel,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(BookingPromotionCustomerGetsService.name);
  }

  public async create(
    payload: CustomerGetsInput[],
    args?: { t: Transaction; promo_id: number },
  ): Promise<any[]> {
    const promises = [];
    for (const p of payload) {
      promises.push(
        await this.customerGetsEntity.create(
          { ...p, promotion_id: args?.promo_id },
          {
            transaction: args?.t,
          },
        ),
      );
    }
    return promises;
  }
}
