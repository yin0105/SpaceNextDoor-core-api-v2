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

import { SpaceModel } from '../spaces/space.model';
import { ISpacePriceEntity } from './interfaces/price.interface';

/**
 * Sequelize model
 * @export
 * @class Price
 * @extends {Model<IPriceEntity>}
 */
@Table({
  modelName: 'PriceModel',
  tableName: 'prices',
})
export class PriceModel extends Model<ISpacePriceEntity> {
  @PrimaryKey
  @AutoIncrement
  @AllowNull(false)
  @Column(DataType.INTEGER)
  @Index
  id: number;

  @AllowNull(false)
  @ForeignKey(() => SpaceModel)
  @Column(DataType.INTEGER)
  space_id: number;

  @AllowNull(true)
  @Column(DataType.FLOAT)
  price_per_day: number;

  @AllowNull(true)
  @Column(DataType.FLOAT)
  price_per_week: number;

  @AllowNull(true)
  @Column(DataType.FLOAT)
  price_per_month: number;

  @AllowNull(true)
  @Column(DataType.FLOAT)
  price_per_year: number;

  @AllowNull(true)
  @Column(DataType.DATE)
  start_date: Date;

  @AllowNull(true)
  @Column(DataType.DATE)
  end_date: Date;

  @AllowNull(true)
  @Column(DataType.STRING(20))
  currency: string;

  @AllowNull(true)
  @Column(DataType.STRING(5))
  currency_sign: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  type: string;

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

  @BelongsTo(() => SpaceModel)
  space: SpaceModel;
}
