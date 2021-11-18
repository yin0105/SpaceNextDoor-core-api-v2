import { ORDER_PICK_UP_SERVICE_REPOSITORY } from '../../shared/constant/app.constant';
import { OrderPickUpServiceModel } from './order-pick-up-service.model';

export const orderPickUpServiceProvider = [
  {
    provide: ORDER_PICK_UP_SERVICE_REPOSITORY,
    useValue: OrderPickUpServiceModel,
  },
];
