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
  Unique,
} from 'sequelize-typescript';

import { UserModel } from '../../auth/users/user.model';
import { CountryModel } from '../../countries/country.model';
import { QuotationStatus } from '../../graphql.schema';
import { PromotionModel } from '../../promotions/promotion/promotion.model';
import { IQuotationEntity } from '../interfaces/quotation.interface';
import { QuotationItemModel } from './quotation-item.model';

@Table({
  modelName: 'QuotationModel',
  tableName: 'quotations',
  updatedAt: false,
})
export class QuotationModel extends Model<IQuotationEntity> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @Index
  id: number;

  @AllowNull(false)
  @Unique
  @Column(DataType.UUID)
  @Index
  uuid: string;

  @AllowNull(false)
  @Default(QuotationStatus.ACTIVE)
  @Column(
    DataType.ENUM(
      QuotationStatus.ACTIVE,
      QuotationStatus.ACCEPTED,
      QuotationStatus.REJECTED,
    ),
  )
  status: QuotationStatus;

  @AllowNull(false)
  @Column(DataType.DATE)
  move_in_date: Date;

  @AllowNull(true)
  @Column(DataType.DATE)
  move_out_date: Date;

  @ForeignKey(() => PromotionModel)
  @Column(DataType.INTEGER)
  promotion_id: number;

  @ForeignKey(() => PromotionModel)
  @Column(DataType.INTEGER)
  public_promotion_id: number;

  @AllowNull(false)
  @ForeignKey(() => UserModel)
  @Column(DataType.INTEGER)
  user_id: number;

  @CreatedAt
  @Default(Sequelize.fn('NOW'))
  @Column(DataType.DATE)
  created_at: Date;

  @AllowNull(true)
  @Column(DataType.DATE)
  expired_at: Date;

  @AllowNull(true)
  @ForeignKey(() => CountryModel)
  @Column(DataType.INTEGER)
  country_id: number;
  //
  @BelongsTo(() => UserModel)
  user: UserModel;

  @HasMany(() => QuotationItemModel)
  items: QuotationItemModel[];

  @BelongsTo(() => PromotionModel, {
    as: 'promotion',
    foreignKey: 'promotion_id',
  })
  promotion: PromotionModel;

  @BelongsTo(() => PromotionModel, {
    as: 'public_promotion',
    foreignKey: 'public_promotion_id',
  })
  public_promotion: PromotionModel;

  @BelongsTo(() => CountryModel)
  country: CountryModel;
}
