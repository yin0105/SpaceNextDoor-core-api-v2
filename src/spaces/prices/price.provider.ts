import { PRICE_REPOSITORY } from '../../shared/constant/app.constant';
import { PriceModel } from './price.model';

export const priceProvider = [
  {
    provide: PRICE_REPOSITORY,
    useValue: PriceModel,
  },
];
