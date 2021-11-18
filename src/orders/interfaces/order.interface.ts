import { Order, OrderStatus } from '../../graphql.schema';

export interface IOrderEntity
  extends Omit<Order, 'customer' | 'booking' | 'order_pick_up_service'> {
  order_pick_up_service_id: number;
  booking_id: number;
  customer_id: number;
}
export interface IOrderStatusFilter {
  _eq: OrderStatus;
}
export interface IOrderCreatedAtFilter {
  _gte?: Date;
  _lte?: Date;
}

export interface IOrdersFilter {
  status?: IOrderStatusFilter;
  created_at?: IOrderCreatedAtFilter;
}
