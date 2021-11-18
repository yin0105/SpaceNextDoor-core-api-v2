import { Inject, Injectable, Logger } from '@nestjs/common';
import { Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

import { OrderPickUpService as PickUpService } from '../../graphql.schema';
import {
  ORDER_PICK_UP_SERVICE_REPOSITORY,
  SEQUELIZE_PROVIDER,
} from '../../shared/constant/app.constant';
import { IOrderPickUpServiceEntity } from './interfaces/order-pick-up-service.interface';
import { OrderPickUpServiceModel } from './order-pick-up-service.model';
@Injectable()
export class OrderPickUpService {
  constructor(
    @Inject(SEQUELIZE_PROVIDER)
    private readonly sequelize: Sequelize,
    @Inject(ORDER_PICK_UP_SERVICE_REPOSITORY)
    private readonly orderPickUpServiceEntity: typeof OrderPickUpServiceModel,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(OrderPickUpService.name);
  }

  async getById(id: number): Promise<PickUpService> {
    const result = await this.orderPickUpServiceEntity.findByPk(id);

    return (result as undefined) as PickUpService;
  }

  public async create(
    payload: Partial<IOrderPickUpServiceEntity>,
    args: { t: Transaction },
  ): Promise<PickUpService> {
    try {
      const orderPickUpService = await this.orderPickUpServiceEntity.create(
        payload,
        {
          transaction: args?.t,
        },
      );

      return (orderPickUpService as undefined) as PickUpService;
    } catch (err) {
      this.logger.error('Create Order Pick Up Service Error:', err?.stack);

      throw err;
    }
  }
}
