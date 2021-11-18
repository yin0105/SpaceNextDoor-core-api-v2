import {
  AllowNull,
  AutoIncrement,
  Column,
  CreatedAt,
  DataType,
  Default,
  HasMany,
  Index,
  Model,
  PrimaryKey,
  Sequelize,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

import { PromotionFormat, PromotionStatus } from '../../graphql.schema';
import { PromotionCustomerBuysModel } from '../customer_buys/customer_buys.model';
import { PromotionCustomerGetsModel } from '../customer_gets/customer_gets.model';
import { PromotionRedeemModel } from '../redeem/redeem.model';
import { IPromotionEntity } from './interfaces/promotion.interface';

@Table({
  modelName: 'PromotionModel',
  tableName: 'promotions',
})
export class PromotionModel extends Model<IPromotionEntity> {
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

  @Default(true)
  @Column(DataType.BOOLEAN)
  allow_double_discount: boolean;

  @CreatedAt
  @Default(Sequelize.fn('NOW'))
  @Column(DataType.DATE)
  created_at: Date;

  @UpdatedAt
  @Default(Sequelize.fn('NOW'))
  @Column(DataType.DATE)
  updated_at: Date;

  //
  @HasMany(() => PromotionCustomerBuysModel, { onDelete: 'CASCADE' })
  customer_buys: PromotionCustomerBuysModel[];

  @HasMany(() => PromotionCustomerGetsModel, { onDelete: 'CASCADE' })
  customer_gets: PromotionCustomerGetsModel[];

  @HasMany(() => PromotionRedeemModel)
  redeem: PromotionRedeemModel[];
}
