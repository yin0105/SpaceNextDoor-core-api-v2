import {
  AllowNull,
  AutoIncrement,
  Column,
  CreatedAt,
  DataType,
  Default,
  Index,
  Model,
  PrimaryKey,
  Sequelize,
  Table,
} from 'sequelize-typescript';

import { IPlatformPropertyTypeEntity } from './interfaces/property-type.interface';

/**
 * Sequelize model
 * @export
 * @class PlatformPropertyType
 * @extends {Model<PlatformPropertyTypeModel>}
 */
@Table({
  modelName: 'PlatformPropertyTypeModel',
  tableName: 'platform_property_types',
  updatedAt: false,
})
export class PlatformPropertyTypeModel extends Model<IPlatformPropertyTypeEntity> {
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

  @Column(DataType.INTEGER)
  created_by: number;

  @CreatedAt
  @Default(Sequelize.fn('NOW'))
  @Column(DataType.DATE)
  created_at: Date;
}
