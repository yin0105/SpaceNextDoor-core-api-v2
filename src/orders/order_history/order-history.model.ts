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

import { UserModel } from '../../auth/users/user.model';
import { BookingModel } from '../../bookings/booking.model';
import { OrderStatus } from '../../graphql.schema';
import { OrderModel } from '../order.model';
import { IOrderHistoryEntity } from './interfaces/order-history.interface';
/**
 * Sequelize model
 * @export
 * @class OrderPickUpServiceHistory
 * @extends {Model<IOrderPickUpServiceHistoryEntity>}
 */
@Table({
  modelName: 'OrderHistory',
  tableName: 'orders_history',
})
export class OrderHistoryModel extends Model<IOrderHistoryEntity> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @Index
  id: number;

  @AllowNull(false)
  @ForeignKey(() => BookingModel)
  @Column(DataType.INTEGER)
  booking_id: number;

  @AllowNull(false)
  @ForeignKey(() => OrderModel)
  @Column(DataType.INTEGER)
  order_id: number;

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
  @Column(DataType.STRING)
  note: string;

  @AllowNull(false)
  @ForeignKey(() => UserModel)
  @Column(DataType.INTEGER)
  changed_by: number;

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

  @BelongsTo(() => OrderModel)
  order: OrderModel;

  @BelongsTo(() => UserModel)
  user: UserModel;
}
