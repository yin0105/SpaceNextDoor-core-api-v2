import { Inject, Injectable, Logger } from '@nestjs/common';
import { Op, Transaction } from 'sequelize';

import { OrderHistory } from '../../graphql.schema';
import { ORDER_HISTORY_REPOSITORY } from '../../shared/constant/app.constant';
import { IOrderHistoryEntity } from './interfaces/order-history.interface';
import { OrderHistoryModel } from './order-history.model';

@Injectable()
export class OrderHistoryService {
  constructor(
    @Inject(ORDER_HISTORY_REPOSITORY)
    private readonly orderHistoryEntity: typeof OrderHistoryModel,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(OrderHistoryService.name);
  }

  async getByOrderId(id: number): Promise<OrderHistory[]> {
    return await this.orderHistoryEntity.findAll({
      where: {
        order_id: { [Op.eq]: id },
      },
    });
  }

  async upsert(
    payload: Omit<IOrderHistoryEntity, 'id' | 'created_at' | 'updated_at'>,
    args?: { t: Transaction },
    id?: number,
  ): Promise<OrderHistory> {
    if (id) {
      await this.orderHistoryEntity.update(payload, {
        where: { id: { [Op.eq]: id } },
        transaction: args.t,
      });
    }

    return await this.orderHistoryEntity.create(payload, {
      transaction: args?.t,
    });
  }

  async getLastHistoryDate(id: number): Promise<OrderHistory> {
    const orderHistorys = await this.orderHistoryEntity.findAll({
      limit: 1,
      where: {
        order_id: { [Op.eq]: id },
      },
      order: [['created_at', 'DESC']],
    });
    return orderHistorys?.[0] || null;
  }
}
