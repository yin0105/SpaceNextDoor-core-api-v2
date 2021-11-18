import { Inject, Injectable, Logger } from '@nestjs/common';
import { Op, Transaction } from 'sequelize';

import { CustomerGets, CustomerGetsInput } from '../../graphql.schema';
import { PROMOTION_CUSTOMER_GETS_REPOSITORY } from '../../shared/constant/app.constant';
import { PromotionCustomerGetsModel } from './customer_gets.model';

@Injectable()
export class PromotionCustomerGetsService {
  constructor(
    @Inject(PROMOTION_CUSTOMER_GETS_REPOSITORY)
    private readonly customerGetsEntity: typeof PromotionCustomerGetsModel,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(PromotionCustomerGetsService.name);
  }

  public async findByPromoId(promoId: number): Promise<CustomerGets[]> {
    return await this.customerGetsEntity.findAll({
      where: { promotion_id: promoId },
    });
  }

  public async upsert(
    promoId: number,
    payload: CustomerGetsInput[],
    args?: { t: Transaction },
  ): Promise<void> {
    const promises = [];
    const payloadIds = payload.map((gets) => gets.id).filter(Boolean);

    const existedGets = await this.customerGetsEntity.findAll({
      where: {
        promotion_id: promoId,
      },
    });

    const idsToDelete = existedGets
      .filter((get) => !payloadIds.includes(get.id))
      .map((get) => get.id);

    promises.push(
      this.customerGetsEntity.destroy({
        where: {
          promotion_id: promoId,
          id: { [Op.in]: idsToDelete },
        },
        transaction: args?.t,
      }),
    );

    payload.forEach((p) => {
      if (p.id) {
        promises.push(
          this.customerGetsEntity.update(p, {
            where: { id: p.id },
            transaction: args?.t,
          }),
        );
      } else {
        promises.push(
          this.customerGetsEntity.create(
            { ...p, promotion_id: promoId },
            {
              transaction: args?.t,
            },
          ),
        );
      }
    });

    await Promise.all(promises);
  }
}
