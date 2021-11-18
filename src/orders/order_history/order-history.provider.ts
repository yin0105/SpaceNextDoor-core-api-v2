import { ORDER_HISTORY_REPOSITORY } from '../../shared/constant/app.constant';
import { OrderHistoryModel } from './order-history.model';

export const orderHistoryProvider = [
  {
    provide: ORDER_HISTORY_REPOSITORY,
    useValue: OrderHistoryModel,
  },
];
