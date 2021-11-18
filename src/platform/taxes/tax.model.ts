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

import { CityModel } from '../../countries/cities/city.model';
import { CountryModel } from '../../countries/country.model';
import { EntityTaxModel } from '../../entity-taxes/entity-tax.model';
import { TaxEntityType, TaxType } from '../../graphql.schema';
import { IPlatformTaxEntity } from './interfaces/tax.interface';

@Table({
  modelName: 'PlatformTaxModel',
  tableName: 'platform_taxes',
})
export class PlatformTaxModel extends Model<IPlatformTaxEntity> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @Index
  id: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  name_en: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  name_th: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  name_jp: string;

  @AllowNull(true)
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
  @Default(TaxType.PERCENTAGE)
  @Column(DataType.ENUM(TaxType.ABSOLUTE, TaxType.PERCENTAGE))
  @Index
  type: TaxType;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  value: number;

  @AllowNull(false)
  @Column(
    DataType.ENUM(
      TaxEntityType.SITE,
      TaxEntityType.INSURANCE,
      TaxEntityType.SERVICE,
    ),
  )
  @Index
  entity_type: TaxEntityType;

  @AllowNull(false)
  @ForeignKey(() => CountryModel)
  @Column(DataType.INTEGER)
  country_id: number;

  @AllowNull(true)
  @ForeignKey(() => CityModel)
  @Column(DataType.INTEGER)
  city_id: number;

  @Default(false)
  @Column(DataType.BOOLEAN)
  exemptible: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  is_default: boolean;

  @Default(true)
  @Column(DataType.BOOLEAN)
  is_active: boolean;

  @Column(DataType.INTEGER)
  created_by: number;

  @Column(DataType.INTEGER)
  updated_by: number;

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

  @BelongsTo(() => CityModel)
  city: CityModel;

  @HasMany(() => EntityTaxModel, { onDelete: 'CASCADE' })
  entity_taxes: EntityTaxModel[];
}
