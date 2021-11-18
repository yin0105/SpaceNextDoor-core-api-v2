import { Inject, Injectable, Logger } from '@nestjs/common';
import { Op, Transaction } from 'sequelize';

import { CustomerBuys, CustomerBuysInput } from '../../../graphql.schema';
import { BOOKING_PROMOTION_CUSTOMER_BUYS_REPOSITORY } from '../../../shared/constant/app.constant';
import { BookingPromotionCustomerBuysModel } from './customer_buys.model';

@Injectable()
export class BookingPromotionCustomerBuysService {
  constructor(
    @Inject(BOOKING_PROMOTION_CUSTOMER_BUYS_REPOSITORY)
    private readonly customerBuysEntity: typeof BookingPromotionCustomerBuysModel,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(BookingPromotionCustomerBuysService.name);
  }

  public async findByPromoId(promoId: number): Promise<CustomerBuys[]> {
    return await this.customerBuysEntity.findAll({
      where: { promotion_id: { [Op.eq]: promoId } },
    });
  }

  public async create(
    payload: CustomerBuysInput[],
    args?: { t: Transaction; promo_id: number },
  ): Promise<any[]> {
    const promises = [];
    for (const p of payload) {
      promises.push(
        await this.customerBuysEntity.create(
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
