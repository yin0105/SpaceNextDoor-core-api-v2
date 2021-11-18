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

import { BookingModel } from '../bookings/booking.model';
import { RefundType } from '../graphql.schema';
import { IRefundEntity } from '../refunds/interfaces/refund.interface';
/**
 * Sequelize model
 * @export
 * @class Refund
 * @extends {Model<RefundModel>}
 */
@Table({
  modelName: 'RefundModel',
  tableName: 'refunds',
})
export class RefundModel extends Model<IRefundEntity> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @Index
  id: number;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  refunded_amount: number;

  @AllowNull(false)
  @Default(Sequelize.fn('NOW'))
  @Column(DataType.DATE)
  refunded_date: Date;

  @AllowNull(false)
  @ForeignKey(() => BookingModel)
  @Column(DataType.INTEGER)
  booking_id: number;

  @AllowNull(false)
  @Default(RefundType.REFUND_CANCEL_BOOKING)
  @Column(
    DataType.ENUM(
      RefundType.REFUND_CANCEL_BOOKING,
      RefundType.REFUND_DEPOSIT,
      RefundType.REFUND_UNUSED_DAYS,
    ),
  )
  type: RefundType;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  penalty_percent: number;

  @AllowNull(true)
  @Column(DataType.TEXT)
  stripe_refund_id: string;

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
}
