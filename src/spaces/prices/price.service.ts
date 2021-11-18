import { Inject, Injectable, Logger } from '@nestjs/common';
import to from 'await-to-js';
import { Op, Transaction } from 'sequelize';

import { PriceType, SpacePrice } from '../../graphql.schema';
import { PRICE_REPOSITORY } from '../../shared/constant/app.constant';
import { NotFoundError } from '../../shared/errors.messages';
import { PriceModel } from '../prices/price.model';
import { ISpacePriceEntity } from './interfaces/price.interface';

@Injectable()
export class PriceService {
  constructor(
    @Inject(PRICE_REPOSITORY)
    private readonly priceEntity: typeof PriceModel,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(PriceService.name);
  }

  async create(
    price: Partial<ISpacePriceEntity>,
    options?: {
      t?: Transaction;
    },
  ): Promise<void> {
    const [err, createdPrice] = await to(
      this.priceEntity.create(price, { transaction: options?.t }),
    );

    if (err || !createdPrice) {
      this.logger.error('Create Price Error: ', err?.stack);
      throw err;
    }
  }

  async getBySpaceId(spaceId: number): Promise<SpacePrice[]> {
    return ((await this.priceEntity.findAll({
      where: {
        space_id: { [Op.eq]: spaceId },
      },
    })) as undefined) as SpacePrice[];
  }

  async update(
    spaceId: number,
    pricePerMonth: number,
    options?: {
      t?: Transaction;
    },
  ): Promise<void> {
    const [findPriceErr, price] = await to(
      this.priceEntity.findOne({
        where: {
          space_id: spaceId,
          type: PriceType.BASE_PRICE,
        },
      }),
    );

    if (findPriceErr || !price) {
      throw NotFoundError('Price not found by this space id');
    }

    const [updatePriceErr, updatePrice] = await to(
      this.priceEntity.update(
        { price_per_month: pricePerMonth },
        { where: { id: { [Op.eq]: price?.id } }, transaction: options?.t },
      ),
    );

    if (updatePriceErr || !updatePrice) {
      this.logger.error('Update Price Error: ', updatePriceErr?.stack);
      throw updatePriceErr;
    }
  }
}
