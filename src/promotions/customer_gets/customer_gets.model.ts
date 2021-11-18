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

import { PromotionForType, PromotionType } from '../../graphql.schema';
import { PromotionModel } from '../promotion/promotion.model';

/**
 * Sequelize model
 * @export
 * @class PromotionCustomerGets
 * @extends {Model<PromotionCustomerGetsModel>}
 */
@Table({
  modelName: 'PromotionCustomerGets',
  tableName: 'promotions_customer_gets',
  createdAt: false,
  updatedAt: false,
})
export class PromotionCustomerGetsModel extends Model<PromotionCustomerGetsModel> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @ForeignKey(() => PromotionModel)
  @Column(DataType.INTEGER)
  @Index
  promotion_id: number;

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
  @BelongsTo(() => PromotionModel)
  promotion: PromotionModel;
}
