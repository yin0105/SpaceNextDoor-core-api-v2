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

import { PlatformFeatureModel } from '../../features/feature.model';
import { PlatformSpaceTypeModel } from '../space-type.model';
import { ISpaceTypeFeatureEntity } from './interfaces/feature.interface';
/**
 * Sequelize model
 * @export
 * @class SpaceTypeFeature
 * @extends {Model<ISpaceTypeFeatureEntity>}
 */
@Table({
  modelName: 'SpaceTypeFeatureModel',
  tableName: 'space_type_features',
  updatedAt: false,
})
export class SpaceTypeFeatureModel extends Model<ISpaceTypeFeatureEntity> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @Index
  id: number;

  @AllowNull(false)
  @ForeignKey(() => PlatformSpaceTypeModel)
  @Column(DataType.INTEGER)
  space_type_id: number;

  @AllowNull(false)
  @ForeignKey(() => PlatformFeatureModel)
  @Column(DataType.INTEGER)
  feature_id: number;

  @Column(DataType.INTEGER)
  created_by: number;

  @CreatedAt
  @Default(Sequelize.fn('NOW'))
  @Column(DataType.DATE)
  created_at: Date;

  //
  // Relation/Association between the other tables

  @BelongsTo(() => PlatformSpaceTypeModel)
  space_type: PlatformSpaceTypeModel;

  @BelongsTo(() => PlatformFeatureModel)
  feature: PlatformFeatureModel;
}
