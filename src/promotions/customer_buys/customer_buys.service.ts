import { Inject, Injectable, Logger } from '@nestjs/common';
import { Op, Transaction } from 'sequelize';

import { CustomerBuys, CustomerBuysInput } from '../../graphql.schema';
import { PROMOTION_CUSTOMER_BUYS_REPOSITORY } from '../../shared/constant/app.constant';
import { PromotionCustomerBuysModel } from './customer_buys.model';

@Injectable()
export class PromotionCustomerBuysService {
  constructor(
    @Inject(PROMOTION_CUSTOMER_BUYS_REPOSITORY)
    private readonly customerBuysEntity: typeof PromotionCustomerBuysModel,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(PromotionCustomerBuysService.name);
  }

  public async findByPromoId(promoId: number): Promise<CustomerBuys[]> {
    return await this.customerBuysEntity.findAll({
      where: { promotion_id: { [Op.eq]: promoId } },
    });
  }

  public async create(
    payload: CustomerBuysInput,
    args?: { t: Transaction; promo_id: number },
  ): Promise<CustomerBuys> {
    return await this.customerBuysEntity.create(
      { ...payload, promotion_id: args?.promo_id },
      {
        transaction: args?.t,
      },
    );
  }

  public async update(
    id: number,
    payload: CustomerBuysInput,
    args?: { t: Transaction },
  ): Promise<any> {
    return await this.customerBuysEntity.update(payload, {
      where: { id: { [Op.eq]: id } },
      transaction: args?.t,
    });
  }
}
