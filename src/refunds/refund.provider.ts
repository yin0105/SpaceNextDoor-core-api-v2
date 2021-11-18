import { REFUND_REPOSITORY } from '../shared/constant/app.constant';
import { RefundModel } from './refund.model';

export const refundProvider = [
  {
    provide: REFUND_REPOSITORY,
    useValue: RefundModel,
  },
];
