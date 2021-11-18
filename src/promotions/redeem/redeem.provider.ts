import { PROMOTION_REDEEM_REPOSITORY } from '../../shared/constant/app.constant';
import { PromotionRedeemModel } from './redeem.model';

export const promotionRedeemProviders = [
  {
    provide: PROMOTION_REDEEM_REPOSITORY,
    useValue: PromotionRedeemModel,
  },
];
