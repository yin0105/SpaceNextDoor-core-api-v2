import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  HasOne,
  Index,
  Model,
  PrimaryKey,
  Sequelize,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

import { UserModel } from '../../auth/users/user.model';
import { RenewalModel } from '../../bookings/renewals/renewal.model';
import { TransactionType } from '../../graphql.schema';
import { OrderModel } from '../../orders/order.model';
import { RefundModel } from '../../refunds/refund.model';
import { TerminationModel } from '../../terminations/termination.model';
import { BookingModel } from '../booking.model';
import { ITransactionEntity } from './interfaces/transaction.interface';

@Table({
  modelName: 'TransactionModel',
  tableName: 'transactions',
})
export class TransactionModel extends Model<ITransactionEntity> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @Index
  id: number;

  @AllowNull(true)
  @Column(DataType.STRING)
  short_id: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  invoice_id: string;

  @AllowNull(false)
  @ForeignKey(() => BookingModel)
  @Column(DataType.INTEGER)
  booking_id: number;

  @AllowNull(true)
  @ForeignKey(() => OrderModel)
  @Column(DataType.INTEGER)
  order_id: number;

  @AllowNull(true)
  @ForeignKey(() => TerminationModel)
  @Column(DataType.INTEGER)
  termination_id: number;

  @AllowNull(true)
  @ForeignKey(() => RenewalModel)
  @Column(DataType.INTEGER)
  renewal_id: number;

  @AllowNull(true)
  @ForeignKey(() => RefundModel)
  @Column(DataType.INTEGER)
  refund_id: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  stripe_charge_id: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  stripe_customer_id: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  card_last_digits: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  card_brand_name: string;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  amount: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  currency: string;

  @AllowNull(false)
  @ForeignKey(() => UserModel)
  @Column(DataType.INTEGER)
  user_id: number;

  @AllowNull(false)
  @Default(TransactionType.BOOKING)
  @Column(
    DataType.ENUM(
      TransactionType.BOOKING,
      TransactionType.ORDER,
      TransactionType.BOOKING_ORDER,
      TransactionType.TERMINATION,
      TransactionType.RENEWAL,
      TransactionType.REFUND_CANCEL_BOOKING,
      TransactionType.REFUND_DEPOSIT,
      TransactionType.REFUND_UNUSED_DAYS,
    ),
  )
  type: TransactionType;

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

  @BelongsTo(() => TerminationModel, { constraints: false })
  termination: TerminationModel;

  @HasOne(() => RenewalModel)
  renewal: RenewalModel;
}
