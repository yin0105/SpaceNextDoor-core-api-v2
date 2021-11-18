import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Index,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

import { PromotionBuyTypes } from '../../../graphql.schema';
import { BookingPromotionModel } from '../promotion/promotion.model';

@Table({
  modelName: 'BookingPromotionCustomerBuys',
  tableName: 'bookings_promotions_customer_buys',
  createdAt: false,
  updatedAt: false,
})
export class BookingPromotionCustomerBuysModel extends Model<BookingPromotionCustomerBuysModel> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @ForeignKey(() => BookingPromotionModel)
  @Column(DataType.INTEGER)
  @Index
  booking_promotion_id: number;

  @AllowNull(false)
  @Column(
    DataType.ENUM(PromotionBuyTypes.MIN_DAYS, PromotionBuyTypes.MIN_PRICE),
  )
  type: PromotionBuyTypes;

  @Column(DataType.INTEGER)
  value: number;

  // relations
  @BelongsTo(() => BookingPromotionModel)
  promotion: BookingPromotionModel;
}
