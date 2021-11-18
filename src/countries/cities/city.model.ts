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

import { CountryModel } from '../country.model';
import { DistrictModel } from '../districts/district.model';
import { ICityEntity } from '../interfaces/country.interface';

/**
 * Sequelize model
 * @export
 * @class City
 * @extends {Model<CityModel>}
 */
@Table({
  modelName: 'CityModel',
  tableName: 'cities',
  updatedAt: false,
})
export class CityModel extends Model<ICityEntity> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @Index
  id: number;

  @AllowNull(false)
  @Column(DataType.STRING(50))
  name_en: string;

  @AllowNull(false)
  @Column(DataType.STRING(50))
  name_th: string;

  @AllowNull(false)
  @Column(DataType.STRING(50))
  name_jp: string;

  @AllowNull(false)
  @Column(DataType.STRING(50))
  name_kr: string;

  @AllowNull(true)
  @Column(DataType.STRING(50))
  temp_name: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(5))
  code: string;

  @AllowNull(false)
  @ForeignKey(() => CountryModel)
  @Column(DataType.INTEGER)
  country_id: number;

  @CreatedAt
  @Default(Sequelize.fn('NOW'))
  @Column(DataType.DATE)
  created_at: Date;

  //
  @BelongsTo(() => CountryModel)
  country: CountryModel;

  @HasMany(() => DistrictModel)
  districts: DistrictModel[];
}
