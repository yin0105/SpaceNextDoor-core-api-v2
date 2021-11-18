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
} from 'sequelize-typescript';

import { PlatformFeatureModel } from '../feature.model';
import { IPlatformFeatureCategoryEntity } from '../interfaces/feature.interface';

/**
 * Sequelize model
 * @export
 * @class PlatformFeatureCategory
 * @extends {Model<PlatformFeatureCategoryModel>}
 */
@Table({
  modelName: 'PlatformFeatureCategoryModel',
  tableName: 'platform_feature_categories',
  updatedAt: false,
})
export class PlatformFeatureCategoryModel extends Model<IPlatformFeatureCategoryEntity> {
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

  //
  // Relation/Association between the other tables

  @HasMany(() => PlatformFeatureModel)
  features: PlatformFeatureModel;
}
