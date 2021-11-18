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
} from 'sequelize-typescript';

import { CityModel } from '../cities/city.model';
import { IDistrictEntity } from '../interfaces/country.interface';
import { LandmarkModel } from '../landmarks/landmark.model';

/**
 * Sequelize model
 * @export
 * @class District
 * @extends {Model<DistrictModel>}
 */
@Table({
  modelName: 'DistrictModel',
  tableName: 'districts',
  updatedAt: false,
})
export class DistrictModel extends Model<IDistrictEntity> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @Index
  id: number;

  @AllowNull(false)
  @Column(DataType.STRING(70))
  name_en: string;

  @AllowNull(false)
  @Column(DataType.STRING(70))
  name_th: string;

  @AllowNull(false)
  @Column(DataType.STRING(70))
  name_jp: string;

  @AllowNull(false)
  @Column(DataType.STRING(70))
  name_kr: string;

  @AllowNull(true)
  @Column(DataType.STRING(50))
  temp_name: string;

  @AllowNull(false)
  @ForeignKey(() => CityModel)
  @Column(DataType.INTEGER)
  city_id: number;

  @CreatedAt
  @Default(Sequelize.fn('NOW'))
  @Column(DataType.DATE)
  created_at: Date;

  //
  @BelongsTo(() => CityModel)
  city: CityModel;

  @HasMany(() => LandmarkModel)
  landmarks: LandmarkModel[];
}
