import { PROMOTION_REPOSITORY } from '../../shared/constant/app.constant';
import { PromotionModel } from './promotion.model';

export const promotionProviders = [
  {
    provide: PROMOTION_REPOSITORY,
    useValue: PromotionModel,
  },
];
