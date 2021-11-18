import { PROMOTION_CUSTOMER_BUYS_REPOSITORY } from '../../shared/constant/app.constant';
import { PromotionCustomerBuysModel } from './customer_buys.model';

export const promotionCustomerBuysProviders = [
  {
    provide: PROMOTION_CUSTOMER_BUYS_REPOSITORY,
    useValue: PromotionCustomerBuysModel,
  },
];
