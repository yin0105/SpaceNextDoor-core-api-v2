import { Inject, Injectable, Logger } from '@nestjs/common';
import { Transaction } from 'sequelize';

import { PROMOTION_REDEEM_REPOSITORY } from '../../shared/constant/app.constant';
import { ICreateRedeemPayload } from './interfaces/redeem.interface';
import { PromotionRedeemModel } from './redeem.model';

@Injectable()
export class PromotionRedeemService {
  constructor(
    @Inject(PROMOTION_REDEEM_REPOSITORY)
    private readonly redeemEntity: typeof PromotionRedeemModel,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(PromotionRedeemService.name);
  }

  public async create(
    payload: ICreateRedeemPayload,
    args: { t: Transaction },
  ): Promise<PromotionRedeemModel> {
    return await this.redeemEntity.create(payload, {
      transaction: args.t,
    });
  }
}
