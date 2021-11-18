import { ORDER_REPOSITORY } from '../shared/constant/app.constant';
import { OrderModel } from './order.model';

export const orderProvider = [
  {
    provide: ORDER_REPOSITORY,
    useValue: OrderModel,
  },
];
