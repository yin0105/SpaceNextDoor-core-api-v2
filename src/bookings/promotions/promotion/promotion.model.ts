import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Index,
  Model,
  PrimaryKey,
  Sequelize,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

import { PromotionFormat, PromotionStatus } from '../../../graphql.schema';
import { PromotionModel } from '../../../promotions/promotion/promotion.model';
import { BookingModel } from '../../booking.model';
import { BookingPromotionCustomerBuysModel } from '../customer_buys/customer_buys.model';
import { BookingPromotionCustomerGetsModel } from '../customer_gets/customer_gets.model';
import { IPromotionEntity } from './interfaces/promotion.interface';

@Table({
  modelName: 'BookingPromotionModel',
  tableName: 'bookings_promotions',
})
export class BookingPromotionModel extends Model<IPromotionEntity> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @Index
  id: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  name_en: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  name_th: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  name_jp: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  name_kr: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  description_en: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  description_th: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  description_jp: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  description_kr: string;

  @AllowNull(false)
  @Column(
    DataType.ENUM(
      PromotionFormat.PUBLIC, // PROMOTION
      PromotionFormat.CODE, // not using
      PromotionFormat.VOUCHER,
    ),
  )
  @Index
  format: PromotionFormat;

  @AllowNull(false)
  @Default(PromotionStatus.DRAFT)
  @Column(
    DataType.ENUM(
      PromotionStatus.DRAFT,
      PromotionStatus.ACTIVE,
      PromotionStatus.IN_ACTIVE,
      PromotionStatus.FINISH,
    ),
  )
  @Index
  status: PromotionStatus;

  @AllowNull(true)
  @Column(DataType.STRING(20))
  @Index
  code: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  start_date: Date;

  @AllowNull(true)
  @Column(DataType.DATE)
  end_date: Date;

  // Max used per promotion - the maximum usage of a promotion within the campaign validity
  @AllowNull(true)
  @Default(null)
  @Column(DataType.INTEGER)
  max: number;

  // Max used per day - the maximum usage of a promotion within the 24 hour window
  @AllowNull(true)
  @Default(null)
  @Column(DataType.INTEGER)
  max_per_day: number;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  max_per_customer: number;

  @AllowNull(false)
  @ForeignKey(() => BookingModel)
  @Column(DataType.INTEGER)
  @Index
  booking_id: number;

  // @ForeignKey(() => OrderModel)
  // @Column(DataType.INTEGER)
  // @Index
  // order_id: number;

  @AllowNull(true)
  @ForeignKey(() => PromotionModel)
  @Column(DataType.INTEGER)
  promotion_id: number;

  @AllowNull(false)
  @Default(Sequelize.fn('NOW'))
  @Column(DataType.DATE)
  applied_at: Date;

  @CreatedAt
  @Default(Sequelize.fn('NOW'))
  @Column(DataType.DATE)
  created_at: Date;

  @UpdatedAt
  @Default(Sequelize.fn('NOW'))
  @Column(DataType.DATE)
  updated_at: Date;

  //
  @HasMany(() => BookingPromotionCustomerBuysModel, { onDelete: 'CASCADE' })
  customer_buys: BookingPromotionCustomerBuysModel[];

  @HasMany(() => BookingPromotionCustomerGetsModel, { onDelete: 'CASCADE' })
  customer_gets: BookingPromotionCustomerGetsModel[];

  @BelongsTo(() => BookingModel)
  booking: BookingModel;

  @BelongsTo(() => PromotionModel)
  promotion: PromotionModel;
}
