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
import { RenewalModel } from '../bookings/renewals/renewal.model';
import { TerminationPaymentStatus, TerminationStatus } from '../graphql.schema';
import { ITerminationEntity } from './interfaces/termination.interface';

@Table({
  modelName: 'TerminationModel',
  tableName: 'terminations',
})
export class TerminationModel extends Model<ITerminationEntity> {
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
  @ForeignKey(() => RenewalModel)
  @Column(DataType.INTEGER)
  last_renewal_id: number;

  @AllowNull(false)
  @Column(DataType.DATE)
  move_out_date: Date;

  @AllowNull(false)
  @Column(DataType.DATE)
  termination_date: Date;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.FLOAT)
  failed_renewals_amount: number;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.FLOAT)
  remaining_days_amount: number; // renewal amount in days if renewal payment was failed

  @AllowNull(false)
  @Default(0)
  @Column(DataType.FLOAT)
  unused_days_amount: number;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.FLOAT)
  notice_period_amount: number; // 14 days amount

  @AllowNull(false)
  @Default(0)
  @Column(DataType.FLOAT)
  promotion_amount: number;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.FLOAT)
  discount: number; // IF CS want to give some offer or so

  @AllowNull(false)
  @Default(0)
  @Column(DataType.FLOAT)
  total_amount: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  currency: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  currency_sign: string;

  @AllowNull(false)
  @Default(TerminationStatus.REQUESTED)
  @Column(
    DataType.ENUM(
      TerminationStatus.REQUESTED,
      TerminationStatus.SCHEDULED,
      TerminationStatus.ON_HOLD,
      TerminationStatus.TERMINATED,
    ),
  )
  status: TerminationStatus;

  @AllowNull(false)
  @Default(TerminationPaymentStatus.PENDING)
  @Column(
    DataType.ENUM(
      TerminationPaymentStatus.PENDING,
      TerminationPaymentStatus.PAID,
      TerminationPaymentStatus.FAILED,
    ),
  )
  payment_status: TerminationPaymentStatus;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  is_overdue: boolean; // in case total_amount is greater than deposit amount

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  is_auto_created: boolean; // in case created by cron job or with request UI

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

  @BelongsTo(() => RenewalModel)
  renewal: RenewalModel;
}
