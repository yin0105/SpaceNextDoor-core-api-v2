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
import { BookingPromotionModel } from '../../bookings/promotions/promotion/promotion.model';
import { RenewalModel } from '../../bookings/renewals/renewal.model';
import { PromotionModel } from '../promotion/promotion.model';
import { IRedeemEntity } from './interfaces/redeem.interface';

@Table({
  modelName: 'PromotionRedeem',
  tableName: 'promotions_redeem',
})
export class PromotionRedeemModel extends Model<IRedeemEntity> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @AllowNull(false)
  @ForeignKey(() => BookingModel)
  @Column(DataType.INTEGER)
  @Index
  booking_id: number;

  @AllowNull(false)
  @ForeignKey(() => PromotionModel)
  @Column(DataType.INTEGER)
  @Index
  promotion_id: number;

  @AllowNull(false)
  @ForeignKey(() => BookingPromotionModel)
  @Column(DataType.INTEGER)
  @Index
  booking_promotion_id: number;

  @AllowNull(false)
  @ForeignKey(() => RenewalModel)
  @Column(DataType.INTEGER)
  @Index
  renewal_id: number;

  // @AllowNull(true)
  // @ForeignKey(() => OrderModel)
  // @Column(DataType.INTEGER)
  // order_id: number;

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

  // relations
  @BelongsTo(() => BookingModel)
  booking: BookingModel;

  @BelongsTo(() => PromotionModel)
  promotion: PromotionModel;

  @BelongsTo(() => BookingPromotionModel)
  booking_promotion: BookingPromotionModel;

  @BelongsTo(() => RenewalModel)
  renewal: RenewalModel;

  @BelongsTo(() => UserModel)
  customer: UserModel;
}
