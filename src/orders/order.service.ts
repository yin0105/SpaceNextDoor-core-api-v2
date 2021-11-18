import { Inject, Injectable, Logger } from '@nestjs/common';
import { Op, Transaction, WhereOptions } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

import { AppliedTaxService } from '../applied-taxes/applied-tax.service';
import { UserModel } from '../auth/users/user.model';
import { BookingModel } from '../bookings/booking.model';
import { BookingService } from '../bookings/booking.service';
import { ITransactionEntity } from '../bookings/transactions/interfaces/transaction.interface';
import { TransactionService } from '../bookings/transactions/transaction.service';
import {
  BookingStatus,
  CancelOrderPayload,
  CancelOrderResp,
  Order,
  OrderPayload,
  OrderStatus,
  PayOrderPayload,
  PayOrderResp,
  ServiceType,
  TransactionType,
} from '../graphql.schema';
import { IDCounterService } from '../ids_counter/ids_counter.service';
import { LogisticsService } from '../logistics/logistics.service';
import { GoGoxLogisticsService } from '../logistics/providers/gogox/gogox.logistics.service';
import { GoGoxOrderStatus } from '../logistics/providers/gogox/interfaces/gogox.interface';
import { Service } from '../platform/services/service';
import {
  ORDER_REPOSITORY,
  SEQUELIZE_PROVIDER,
} from '../shared/constant/app.constant';
import {
  BadRequestError,
  NotFoundError,
  PayloadError,
} from '../shared/errors.messages';
import { toSequelizeComparator } from '../shared/utils/graphql-to-sequelize-comparator';
import { StripeService } from '../stripe/stripe.service';
import { IOrderEntity, IOrdersFilter } from './interfaces/order.interface';
import { IOrderHistoryEntity } from './order_history/interfaces/order-history.interface';
import { OrderHistoryService } from './order_history/order-history.service';
import { OrderModel } from './order.model';
import { IOrderPickUpServiceEntity } from './pick_up_service/interfaces/order-pick-up-service.interface';
import { OrderPickUpServiceModel } from './pick_up_service/order-pick-up-service.model';
import { OrderPickUpService } from './pick_up_service/order-pick-up-service.service';
import createOrderValidator from './validation/create-order.payload';

@Injectable()
export class OrderService {
  constructor(
    private readonly bookingService: BookingService,
    @Inject(SEQUELIZE_PROVIDER)
    private readonly sequelize: Sequelize,
    @Inject(ORDER_REPOSITORY)
    private readonly orderEntity: typeof OrderModel,
    private readonly orderHistoryService: OrderHistoryService,
    private readonly service: Service,
    private readonly idCounterService: IDCounterService,
    private readonly orderPickUpService: OrderPickUpService,
    private readonly stripeService: StripeService,
    private readonly logisticsService: LogisticsService,
    private readonly goGoXService: GoGoxLogisticsService,
    private readonly transactionService: TransactionService,
    private readonly appliedTaxService: AppliedTaxService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(OrderPickUpService.name);
  }

  public async validateCreateOrderPayload(
    payload: OrderPayload,
  ): Promise<void> {
    const pickUpDate = new Date(payload?.pickup_service_details?.pickup_time);
    const currentDate = new Date();
    if (pickUpDate < currentDate) {
      throw BadRequestError('Pickup date should be greater than current date');
    }
    try {
      await createOrderValidator.validate(payload);
    } catch (e) {
      throw PayloadError(e.message);
    }
  }

  async getById(id: number): Promise<Order> {
    const result = await this.orderEntity.findByPk(id, {
      include: [{ model: UserModel }],
    });

    return (result as undefined) as Order;
  }

  public async create(payload: OrderPayload): Promise<Order> {
    type CreateOrder = Omit<IOrderEntity, 'created_at' | 'updated_at' | 'id'>;

    type CreateOrderHistory = Omit<
      IOrderHistoryEntity,
      'id' | 'created_at' | 'updated_at'
    >;

    const booking = await this.bookingService.getById({
      id: { _eq: payload?.booking_id },
    });

    if (!booking) {
      throw NotFoundError('Booking not found!');
    }

    if (!Object.keys(payload.pickup_service_details).length) {
      // Required until we have more objects in payload
      throw BadRequestError('Pickup details are required!');
    }

    if (
      booking?.status === BookingStatus.CANCELLED ||
      booking?.status === BookingStatus.COMPLETED ||
      booking?.status === BookingStatus.TERMINATED
    ) {
      throw BadRequestError('You can not add order to this booking');
    }

    const service = await this.service.getByIdAndType(
      payload?.pickup_service_details?.service_id,
      ServiceType.PICK_UP,
    );
    if (!service) {
      throw NotFoundError('Service not found!');
    }

    if (
      !this.goGoXService.vehicleTypeValidate(
        (booking as any)?.space?.platform_space_type?.name_en,
        service?.vehicle_code,
      )
    ) {
      throw BadRequestError('Selected vehicle is too small!');
    }

    const logistics = await this.logisticsService.createOrder(
      this.goGoXService,
      {
        customer: {
          address: payload.pickup_service_details?.address,
          name: `${booking?.customer?.first_name} ${booking?.customer?.last_name}`,
          phone: booking?.customer_phone_number,
          location: {
            lat: payload.pickup_service_details?.lat,
            lng: payload.pickup_service_details?.lng,
          },
        },
        site: {
          address: `${booking?.site_address?.street} ${booking?.site_address?.postal_code}`,
          name: `${booking?.customer?.first_name} ${booking?.customer?.last_name}`,
          phone: booking?.customer_phone_number,
          floor: booking?.site_address?.flat,
          location: {
            lat: booking?.site_address?.lat,
            lng: booking?.site_address?.lng,
          },
        },
        scheduledAt: new Date(payload.pickup_service_details?.pickup_time),
        vehicle: service?.vehicle_code,
        extraRequirements:
          payload.pickup_service_details?.additional_requirements,
      },
    );

    // calculate tax
    const taxes = await this.appliedTaxService.calculateTax({
      pickup_service_id: payload?.pickup_service_details?.service_id,
      pickup_service_price: logistics?.amount,
    });

    const totalAmount =
      parseFloat((logistics?.amount + taxes.totalTax).toFixed(2)) || 0;
    const orderPickUpServicePayload: Partial<IOrderPickUpServiceEntity> = {
      address: payload?.pickup_service_details?.address,
      lat: payload?.pickup_service_details?.lat,
      lng: payload?.pickup_service_details?.lng,
      pickup_time: payload?.pickup_service_details?.pickup_time,
      currency: service?.country?.currency,
      currency_sign: service?.country?.currency_sign,
      service_id: payload?.pickup_service_details?.service_id,
      amount: logistics?.amount,
      third_party_tracking_id: logistics?.order_id,
      discount_amount: 0,
      tax_amount: taxes.totalTax,
      total_amount: totalAmount,
      mover_count:
        payload?.pickup_service_details?.additional_requirements?.mover_count ||
        0,
    };

    const t = await this.sequelize.transaction();

    try {
      const shortId = await this.idCounterService.generateOrderId();

      const orderPickUpService = await this.orderPickUpService.create(
        orderPickUpServicePayload,
        { t },
      );

      const orderPayload: CreateOrder = {
        booking_id: payload?.booking_id,
        short_id: shortId,
        order_pick_up_service_id: orderPickUpService?.id,
        status: OrderStatus.PENDING,
        customer_id: booking?.customer?.id,
        total_amount: totalAmount,
        currency: service?.country?.currency,
      };

      const order = await this.orderEntity.create(orderPayload, {
        transaction: t,
      });

      const orderHistoryPayload: CreateOrderHistory = {
        booking_id: payload?.booking_id,
        order_id: order?.id,
        status: OrderStatus.PENDING,
        note: 'Your order has been created!',
        changed_by: booking?.customer?.id,
      };

      await this.orderHistoryService.upsert(orderHistoryPayload, { t });

      //
      await this.appliedTaxService.createAppliedTaxes(taxes.taxes, booking.id, {
        userId: booking?.customer?.id,
        orderPickUpServiceId: orderPickUpService.id,
        orderId: order.id,
        t,
      });

      await t.commit();

      return await this.getById(order?.id);
    } catch (err) {
      this.logger.error('Create Order Error:', err?.stack);

      await t.rollback();

      if (logistics) {
        await this.logisticsService.cancelOrder(
          this.goGoXService,
          logistics.order_id,
        );
      }

      throw err;
    }
  }

  public async updateOrderStatus(
    status: OrderStatus,
    where: IOrdersFilter,
  ): Promise<{ modified: number; orders: OrderModel[] }> {
    const whereFilter: WhereOptions = toSequelizeComparator({
      status: where?.status,
      created_at: where?.created_at,
    });

    const [modified, updatedOrders] = await this.orderEntity.update(
      {
        status,
      },
      {
        where: whereFilter,
        returning: true,
      },
    );

    const orderIds = updatedOrders.map((order) => order?.id);

    // we're querying all the updated orders with including User Model
    const orders = await this.orderEntity.findAll({
      where: { id: { [Op.in]: orderIds } },
      include: [{ model: UserModel }],
    });

    return { modified, orders };
  }

  public async update(
    payload: Partial<IOrderEntity>,
    id: number,
    args: { t: Transaction },
  ): Promise<Order> {
    return (await this.orderEntity.update(payload, {
      where: { id },
      transaction: args?.t,
    })) as undefined;
  }

  public async payOrder(payload: PayOrderPayload): Promise<PayOrderResp> {
    type CreateOrderHistory = Omit<
      IOrderHistoryEntity,
      'id' | 'created_at' | 'updated_at'
    >;

    const order = await this.orderEntity.findByPk(payload?.order_id, {
      include: [{ model: UserModel }, { model: BookingModel }],
    });

    if (!order) {
      throw NotFoundError('No Order found!');
    }

    if (order?.status !== OrderStatus.PENDING) {
      throw BadRequestError('You can not pay when order status is not pending');
    }

    const orderHistoryPayload: CreateOrderHistory = {
      booking_id: order?.booking_id,
      order_id: order?.id,
      status: OrderStatus.CONFIRMED,
      note: 'You order has been confirmed!',
      changed_by: order?.customer_id,
    };

    const stripeCustomerId = order?.customer?.stripe_customer_id;
    const amount = parseFloat(order?.total_amount.toFixed(2));
    const currency = order?.currency.toLowerCase() || '';
    const t = await this.sequelize.transaction();
    let charge;

    const chargeAmount = this.stripeService.calculateAmountInCurrency(
      amount,
      currency,
    );

    try {
      const transactionShortId = await this.idCounterService.generateTransactionId();

      const invoiceId = await this.idCounterService.generateInvoiceId();

      const card = await this.stripeService.retrieveCard(stripeCustomerId);

      charge = await this.stripeService.charge(
        chargeAmount,
        currency,
        stripeCustomerId,
        `Payment for pickup of booking #${order?.booking?.short_id}, order #${order.short_id}`,
      );

      const transactionPayload: Partial<ITransactionEntity> = {
        short_id: transactionShortId,
        invoice_id: invoiceId,
        stripe_charge_id: charge?.id,
        order_id: payload?.order_id,
        stripe_customer_id: stripeCustomerId,
        card_last_digits: card?.last4,
        card_brand_name: card?.brand,
        amount,
        currency,
        booking_id: order.booking_id,
        type: TransactionType.ORDER,
        user_id: order.customer_id,
      };

      await Promise.all([
        await this.transactionService.create(transactionPayload, { t }),
        await this.orderEntity.update(
          { status: OrderStatus.CONFIRMED },
          {
            where: { id: payload?.order_id },
            transaction: t,
          },
        ),
        await this.orderHistoryService.upsert(orderHistoryPayload, { t }),
      ]);

      await t.commit();

      return { success: true };
    } catch (err) {
      if (charge) {
        await this.stripeService.refund(charge?.id);
      }

      this.logger.error('Pay Order Error:', err?.stack);

      await t.rollback();

      throw err;
    }
  }

  public async getLastStatus(orderId: number): Promise<Date> {
    const orderHistory = await this.orderHistoryService.getLastHistoryDate(
      orderId,
    );
    return orderHistory?.created_at;
  }

  public async cancelOrder(
    payload: CancelOrderPayload,
  ): Promise<CancelOrderResp> {
    type CancelOrderHistory = Omit<
      IOrderHistoryEntity,
      'id' | 'created_at' | 'updated_at'
    >;
    const update = async (
      history: CancelOrderHistory,
      orderId: number,
      orderStatus: OrderStatus,
    ) => {
      const t = await this.sequelize.transaction();
      try {
        await this.update({ status: orderStatus }, orderId, { t });
        await this.orderHistoryService.upsert(history, { t });
        await t.commit();
      } catch (error) {
        await t.rollback();
        throw error;
      }
    };
    const order = await this.orderEntity.findByPk(payload?.order_id, {
      include: [{ model: OrderPickUpServiceModel }],
    });
    if (!order) {
      throw NotFoundError('No Order found!');
    }

    // Only Pending and Confirmed order can be Cancelled
    if (
      order?.status !== OrderStatus.PENDING &&
      order?.status !== OrderStatus.CONFIRMED
    ) {
      throw BadRequestError('Invalid status');
    }
    if (order?.order_pick_up_service) {
      const gogoxOrder = await this.goGoXService.getOrder(
        order?.order_pick_up_service.third_party_tracking_id,
      );
      if (gogoxOrder.status !== GoGoxOrderStatus.PENDING) {
        // Update SND Order status to map with Gogox Order Status
        const ohPayload: CancelOrderHistory = {
          booking_id: order?.booking_id,
          order_id: order?.id,
          status: OrderStatus[gogoxOrder.status.toUpperCase()],
          note: `Your order has been ${gogoxOrder.status.toUpperCase()} by Gogox!`,
          changed_by: order?.customer_id,
        };
        await update(
          ohPayload,
          order?.id,
          OrderStatus[gogoxOrder.status.toUpperCase()],
        );
        throw BadRequestError(
          `Cannot cancel this order because Gogox order was changed to ${gogoxOrder.status.toUpperCase()}!`,
        );
      }

      // Request to cancel Gogox Order
      await this.goGoXService.cancelOrder(
        order?.order_pick_up_service.third_party_tracking_id,
      );
    }

    // Refund if transaction is available
    const transaction = await this.transactionService.getByOrderId(
      payload?.order_id,
    );
    if (transaction) {
      const refunAmount = this.stripeService.calculateAmountInCurrency(
        order?.order_pick_up_service?.amount,
        order?.order_pick_up_service?.currency,
      );
      await this.stripeService.refundWithAmount(
        transaction.stripe_charge_id,
        refunAmount,
      );
    }

    const orderHistoryPayload: CancelOrderHistory = {
      booking_id: order?.booking_id,
      order_id: order?.id,
      status: OrderStatus.CANCELLED,
      note: 'Your order has been cancelled!',
      changed_by: order?.customer_id,
    };
    // Add record to order_history and Update Order Status to CANCELLED
    await update(orderHistoryPayload, order?.id, OrderStatus.CANCELLED);
    return { success: true };
  }
}
