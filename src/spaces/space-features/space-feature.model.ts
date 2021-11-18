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

import { PlatformFeatureModel } from '../../platform/features/feature.model';
import { SpaceModel } from '../spaces/space.model';
import { ISpaceFeatureEntity } from './interfaces/space-feature.interface';

/**
 * Sequelize model
 * @export
 * @class SpaceFeature
 * @extends {Model<ISpaceFeatureEntity>}
 */
@Table({
  modelName: 'SpaceFeatureModel',
  tableName: 'space_features',
})
export class SpaceFeatureModel extends Model<ISpaceFeatureEntity> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @Index
  id: number;

  @AllowNull(false)
  @ForeignKey(() => SpaceModel)
  @Column(DataType.INTEGER)
  space_id: number;

  @AllowNull(false)
  @ForeignKey(() => PlatformFeatureModel)
  @Column(DataType.INTEGER)
  feature_id: number;

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

  @BelongsTo(() => PlatformFeatureModel)
  feature: PlatformFeatureModel;
}
