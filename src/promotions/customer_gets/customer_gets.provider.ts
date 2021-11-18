import { PROMOTION_CUSTOMER_GETS_REPOSITORY } from '../../shared/constant/app.constant';
import { PromotionCustomerGetsModel } from './customer_gets.model';

export const promotionCustomerGetsProviders = [
  {
    provide: PROMOTION_CUSTOMER_GETS_REPOSITORY,
    useValue: PromotionCustomerGetsModel,
  },
];
