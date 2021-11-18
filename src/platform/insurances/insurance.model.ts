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

import { CountryModel } from '../../countries/country.model';
import { EntityTaxModel } from '../../entity-taxes/entity-tax.model';
import { IPlatformInsuranceEntity } from '../insurances/interfaces/insurance.interface';

@Table({
  modelName: 'PlatformInsuranceModel',
  tableName: 'platform_insurances',
})
export class PlatformInsuranceModel extends Model<IPlatformInsuranceEntity> {
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

  @AllowNull(false)
  @Column(DataType.STRING)
  third_party_provider: string;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  covered_amount: number;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  price_per_day: number;

  @AllowNull(false)
  @ForeignKey(() => CountryModel)
  @Column(DataType.INTEGER)
  country_id: number;

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

  @BelongsTo(() => CountryModel)
  country: CountryModel;

  @HasMany(() => EntityTaxModel)
  entity_taxes: EntityTaxModel[];
}
