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

import { PlatformFeatureModel } from '../../platform/features/feature.model';
import { SiteModel } from '../sites/site.model';
import { ISiteFeatureEntity } from './interfaces/site-feature.interface';

/**
 * Sequelize model
 * @export
 * @class SiteFeature
 * @extends {Model<ISiteFeatureEntity>}
 */
@Table({
  modelName: 'SiteFeatureModel',
  tableName: 'site_features',
  updatedAt: false,
})
export class SiteFeatureModel extends Model<ISiteFeatureEntity> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @Index
  id: number;

  @AllowNull(false)
  @ForeignKey(() => SiteModel)
  @Column(DataType.INTEGER)
  site_id: number;

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

  @BelongsTo(() => SiteModel)
  site: SiteModel;

  @BelongsTo(() => PlatformFeatureModel)
  feature: PlatformFeatureModel;
}
