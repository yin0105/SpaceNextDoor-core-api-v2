import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Index,
  Min,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

import { PromotionForType, PromotionType } from '../../../graphql.schema';
import { BookingPromotionModel } from '../promotion/promotion.model';

@Table({
  modelName: 'BookingPromotionCustomerGets',
  tableName: 'bookings_promotions_customer_gets',
  createdAt: false,
  updatedAt: false,
})
export class BookingPromotionCustomerGetsModel extends Model<BookingPromotionCustomerGetsModel> {
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
    DataType.ENUM(
      PromotionType.FIXED_AMOUNT_DISCOUNT,
      PromotionType.PERCENTAGE_DISCOUNT,
      PromotionType.TOTAL_AMOUNT,
    ),
  )
  @Index
  type: PromotionType;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  value: number;

  @AllowNull(true)
  @Column(DataType.FLOAT)
  max_amount_per_booking: number;

  @AllowNull(false)
  @Column(
    DataType.ENUM(
      PromotionForType.FIRST_MONTHS,
      PromotionForType.LAST_MONTHS,
      PromotionForType.RENEWAL_INDEX,
    ),
  )
  for_type: PromotionForType;

  @AllowNull(false)
  @Min(1)
  @Column(DataType.INTEGER)
  for_value: number; //

  // relations
  @BelongsTo(() => BookingPromotionModel)
  promotion: BookingPromotionModel;
}
