import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  Index,
  Model,
  PrimaryKey,
  Sequelize,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

import { UserModel } from '../auth/users/user.model';
import { BookingModel } from '../bookings/booking.model';
import { OrderStatus } from '../graphql.schema';
import { IOrderEntity } from './interfaces/order.interface';
import { OrderPickUpServiceModel } from './pick_up_service/order-pick-up-service.model';

@Table({
  modelName: 'OrderModel',
  tableName: 'orders',
})
export class OrderModel extends Model<IOrderEntity> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @Index
  id: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  short_id: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  currency: string;

  @AllowNull(false)
  @Column(
    DataType.ENUM(
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.COMPLETED,
      OrderStatus.CANCELLED,
    ),
  )
  status: OrderStatus;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  total_amount: number;

  @AllowNull(false)
  @ForeignKey(() => BookingModel)
  @Column(DataType.INTEGER)
  booking_id: number;

  @AllowNull(true)
  @ForeignKey(() => OrderPickUpServiceModel)
  @Column(DataType.INTEGER)
  order_pick_up_service_id: number;

  @AllowNull(false)
  @ForeignKey(() => UserModel)
  @Column(DataType.INTEGER)
  customer_id: number;

  @CreatedAt
  @Default(Sequelize.fn('NOW'))
  @Column(DataType.DATE)
  created_at: Date;

  @UpdatedAt
  @Default(Sequelize.fn('NOW'))
  @Column(DataType.DATE)
  updated_at: Date;

  //
  // Relation/Association between the other tables

  @BelongsTo(() => BookingModel)
  booking: BookingModel;

  @BelongsTo(() => UserModel)
  customer: UserModel;

  @BelongsTo(() => OrderPickUpServiceModel)
  order_pick_up_service: OrderPickUpServiceModel;
}
