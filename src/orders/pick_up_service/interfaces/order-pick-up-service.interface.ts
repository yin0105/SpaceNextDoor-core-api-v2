import { OrderPickUpService } from '../../../graphql.schema';

export interface IOrderPickUpServiceEntity
  extends Omit<OrderPickUpService, 'service'> {
  third_party_tracking_id: string;
  service_id: number;
}
