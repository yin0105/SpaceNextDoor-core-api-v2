import { Logger } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { UserService } from '../auth/users/user.service';
import { BookingService } from '../bookings/booking.service';
import {
  Booking,
  CancelOrderPayload,
  CancelOrderResp,
  Customer,
  Order,
  OrderPayload,
  OrderPickUpService as PickUpService,
  PayOrderPayload,
  PayOrderResp,
} from '../graphql.schema';
import { IOrderEntity } from './interfaces/order.interface';
import { OrderService } from './order.service';
import { OrderPickUpService } from './pick_up_service/order-pick-up-service.service';

@Resolver('Order')
export class OrderResolver {
  constructor(
    private readonly orderService: OrderService,
    private readonly bookingService: BookingService,
    private readonly userService: UserService,
    private readonly pickUpService: OrderPickUpService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(OrderResolver.name);
  }

  @Mutation('createOrder')
  async addPickUpService(
    @Args('payload') payload: OrderPayload,
  ): Promise<Order> {
    await this.orderService.validateCreateOrderPayload(payload);

    return this.orderService.create(payload);
  }

  @Mutation('payOrder')
  async payOrder(
    @Args('payload') payload: PayOrderPayload,
  ): Promise<PayOrderResp> {
    return this.orderService.payOrder(payload);
  }

  @Mutation('cancelOrder')
  async cancelOrder(
    @Args('payload') payload: CancelOrderPayload,
  ): Promise<CancelOrderResp> {
    return this.orderService.cancelOrder(payload);
  }

  @ResolveField('booking')
  async booking(@Parent() order: IOrderEntity): Promise<Booking> {
    return this.bookingService.getById({
      id: { _eq: order?.booking_id },
    });
  }

  @ResolveField('customer')
  async customer(@Parent() order: IOrderEntity): Promise<Customer> {
    return this.userService.findOne(order?.customer_id);
  }

  @ResolveField('order_pick_up_service')
  async orderPickUpService(
    @Parent() order: IOrderEntity,
  ): Promise<PickUpService> {
    return this.pickUpService.getById(order?.order_pick_up_service_id);
  }

  @ResolveField('last_status_at')
  async lastStatusAt(@Parent() order: IOrderEntity): Promise<Date> {
    return this.orderService.getLastStatus(order.id);
  }
}
