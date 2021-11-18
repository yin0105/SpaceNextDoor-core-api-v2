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
import { RenewalModel } from '../bookings/renewals/renewal.model';
import { PayoutStatus } from '../graphql.schema';
import { IPayoutEntity } from './interfaces/payout.interface';
/**
 * Sequelize model
 * @export
 * @class Payout
 * @extends {Model<IPayoutEntity>}
 */
@Table({
  modelName: 'PayoutModel',
  tableName: 'payouts',
})
export class PayoutModel extends Model<IPayoutEntity> {
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
  renewal_id: number;

  @AllowNull(false)
  @ForeignKey(() => UserModel)
  @Column(DataType.INTEGER)
  provider_id: number;

  @AllowNull(false)
  @Column(DataType.ENUM(PayoutStatus.PAID, PayoutStatus.PENDING))
  status: PayoutStatus;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  amount: number;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  commission_percentage: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  currency: string;

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
  provider: UserModel;

  @BelongsTo(() => RenewalModel)
  renewal: RenewalModel;
}
