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
  Unique,
} from 'sequelize-typescript';

import { CityModel } from './cities/city.model';
import { ICountryEntity } from './interfaces/country.interface';

/**
 * Sequelize model
 * @export
 * @class Country
 * @extends {Model<CountryModel>}
 */
@Table({
  modelName: 'CountryModel',
  tableName: 'countries',
  updatedAt: false,
})
export class CountryModel extends Model<ICountryEntity> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @Index
  id: number;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(50))
  name_en: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(50))
  name_th: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(50))
  name_jp: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(50))
  name_kr: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(5))
  code: string;

  @AllowNull(false)
  @Column(DataType.STRING(20))
  currency: string;

  @AllowNull(false)
  @Column(DataType.STRING(5))
  currency_sign: string;

  @CreatedAt
  @Default(Sequelize.fn('NOW'))
  @Column(DataType.DATE)
  created_at: Date;

  //
  @HasMany(() => CityModel)
  cities: CityModel[];
}
