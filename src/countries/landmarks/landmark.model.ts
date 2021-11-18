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
} from 'sequelize-typescript';

import { DistrictModel } from '../districts/district.model';
import { ILandmarkEntity } from '../interfaces/country.interface';

/**
 * Sequelize model
 * @export
 * @class District
 * @extends {Model<DistrictModel>}
 */
@Table({
  modelName: 'LandmarkModel',
  tableName: 'landmarks',
  updatedAt: false,
})
export class LandmarkModel extends Model<ILandmarkEntity> {
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

  @AllowNull(false)
  @ForeignKey(() => DistrictModel)
  @Column(DataType.INTEGER)
  district_id: number;

  @CreatedAt
  @Default(Sequelize.fn('NOW'))
  @Column(DataType.DATE)
  created_at: Date;

  //
  @BelongsTo(() => DistrictModel)
  city: DistrictModel;
}
