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

import { RenewalStatus, RenewalType } from '../../graphql.schema';
import { PlatformInsuranceModel } from '../../platform/insurances/insurance.model';
import { PromotionModel } from '../../promotions/promotion/promotion.model';
import { BookingModel } from '../booking.model';
import { BookingPromotionModel } from '../promotions/promotion/promotion.model';
import { TransactionModel } from '../transactions/transaction.model';
import { IRenewalEntity } from './interfaces/renewal.interface';
/**
 * Sequelize model
 * @export
 * @class Renewal
 * @extends {Model<IRenewalEntity>}
 */
@Table({
  modelName: 'RenewalModel',
  tableName: 'renewals',
})
export class RenewalModel extends Model<IRenewalEntity> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @Index
  id: number;

  @AllowNull(false)
  @ForeignKey(() => BookingModel)
  @Column(DataType.INTEGER)
  booking_id: number;

  @AllowNull(true)
  @ForeignKey(() => TransactionModel)
  @Column(DataType.INTEGER)
  transaction_id: number;

  @AllowNull(true)
  @ForeignKey(() => PlatformInsuranceModel)
  @Column(DataType.INTEGER)
  insurance_id: number;

  @AllowNull(true)
  @ForeignKey(() => PromotionModel)
  @Column(DataType.INTEGER)
  promotion_id: number; // voucher promotion id

  @AllowNull(true)
  @ForeignKey(() => PromotionModel)
  @Column(DataType.INTEGER)
  public_promotion_id: number;

  @AllowNull(true)
  @ForeignKey(() => BookingPromotionModel)
  @Column(DataType.INTEGER)
  booking_promotion_id: number;

  @AllowNull(true)
  @ForeignKey(() => BookingPromotionModel)
  @Column(DataType.INTEGER)
  booking_public_promotion_id: number;

  @AllowNull(true)
  @Column(DataType.DATE)
  next_renewal_date: Date;

  @AllowNull(true)
  @Column(DataType.DATE)
  renewal_start_date: Date;

  @AllowNull(true)
  @Column(DataType.DATE)
  renewal_end_date: Date;

  @AllowNull(true)
  @Column(DataType.DATE)
  renewal_paid_date: Date;

  @AllowNull(true)
  @Default(null)
  @Column(DataType.DATE)
  last_attempt_date: Date;

  @AllowNull(false)
  @Column(
    DataType.ENUM(
      RenewalStatus.PAID,
      RenewalStatus.UN_PAID,
      RenewalStatus.FAILED,
    ),
  )
  status: RenewalStatus;

  @AllowNull(false)
  @Column(
    DataType.ENUM(
      RenewalType.BOOKING,
      RenewalType.FULL_SUBSCRIPTION,
      RenewalType.PARTIAL_SUBSCRIPTION,
    ),
  )
  type: RenewalType;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  base_amount: number;

  @AllowNull(true)
  @Column(DataType.FLOAT)
  insurance_amount: number;

  @AllowNull(true)
  @Column(DataType.FLOAT)
  deposit_amount: number;

  @Default(0)
  @Column(DataType.FLOAT)
  total_tax_amount: number;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  total_amount: number; // total amount inclusive of discount

  @AllowNull(false)
  @Default(0)
  @Column(DataType.FLOAT)
  discount_amount: number;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  sub_total_amount: number; // total amount exclusive of discount

  // these next renewal fields needed for business intelligence as projection
  @Default(null)
  @Column(DataType.FLOAT)
  next_renewal_sub_total: number; // amount inclusive of next renewal discount, tax

  @Default(null)
  @Column(DataType.FLOAT)
  next_renewal_total: number; // amount inclusive of next renewal discount, tax

  @Default(null)
  @Column(DataType.FLOAT)
  next_renewal_discount: number;

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

  @BelongsTo(() => PromotionModel)
  promotion: PromotionModel;

  @BelongsTo(() => BookingPromotionModel, {
    as: 'booking_promotion',
    foreignKey: 'booking_promotion_id',
  })
  booking_promotion: BookingPromotionModel;

  @BelongsTo(() => PromotionModel, {
    as: 'public_promotion',
    foreignKey: 'public_promotion_id',
  })
  public_promotion: PromotionModel;

  @BelongsTo(() => BookingPromotionModel, {
    as: 'booking_public_promotion',
    foreignKey: 'booking_public_promotion_id',
  })
  booking_public_promotion: BookingPromotionModel;

  @BelongsTo(() => TransactionModel)
  transaction: TransactionModel;

  @BelongsTo(() => PlatformInsuranceModel)
  insurance: PlatformInsuranceModel;
}
