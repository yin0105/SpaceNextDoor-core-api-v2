import { OrderHistory } from '../../../graphql.schema';

export interface IOrderHistoryEntity extends OrderHistory {
  booking_id: number;
  order_id: number;
  changed_by: number;
}
