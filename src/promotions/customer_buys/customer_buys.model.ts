import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Index,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

import { CountryModel } from '../../countries/country.model';
import { PromotionBuyTypes } from '../../graphql.schema';
import { PromotionModel } from '../promotion/promotion.model';

@Table({
  modelName: 'PromotionCustomerBuys',
  tableName: 'promotions_customer_buys',
  createdAt: false,
  updatedAt: false,
})
export class PromotionCustomerBuysModel extends Model<PromotionCustomerBuysModel> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @ForeignKey(() => PromotionModel)
  @Column(DataType.INTEGER)
  @Index
  promotion_id: number;

  @Default([])
  @Column(DataType.ARRAY(DataType.INTEGER))
  site_ids: number[]; // use only for PUBLIC type of promotions

  @AllowNull(false)
  @Column(
    DataType.ENUM(PromotionBuyTypes.MIN_DAYS, PromotionBuyTypes.MIN_PRICE),
  )
  type: PromotionBuyTypes;

  @Column(DataType.INTEGER)
  value: number;

  @AllowNull(true)
  @ForeignKey(() => CountryModel)
  @Column(DataType.INTEGER)
  country_id: number; // [NOT USING ANYMORE] to restrict VOUCHER promotions by country

  @AllowNull(true)
  @Default([])
  @Column(DataType.ARRAY(DataType.INTEGER))
  country_ids: number[]; // to restrict VOUCHER promotions by country

  // relations
  @BelongsTo(() => PromotionModel)
  promotion: PromotionModel;
}
