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

import { PlatformFeatureType } from '../../graphql.schema';
import { PlatformFeatureCategoryModel } from './categories/feature-category.model';
import { IPlatformFeatureEntity } from './interfaces/feature.interface';

/**
 * Sequelize model
 * @export
 * @class PlatformFeature
 * @extends {Model<PlatformFeatureModel>}
 */
@Table({
  modelName: 'PlatformFeatureModel',
  tableName: 'platform_features',
  updatedAt: false,
})
export class PlatformFeatureModel extends Model<IPlatformFeatureEntity> {
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

  @Column(DataType.STRING)
  description_en: string;

  @Column(DataType.STRING)
  description_th: string;

  @Column(DataType.STRING)
  description_jp: string;

  @Column(DataType.STRING)
  description_kr: string;

  @Column(DataType.STRING)
  icon: string;

  @AllowNull(false)
  @Column(
    DataType.ENUM(
      PlatformFeatureType.SITE,
      PlatformFeatureType.SPACE,
      PlatformFeatureType.SPACE_TYPE,
    ),
  )
  type: PlatformFeatureType;

  @Column(DataType.BOOLEAN)
  is_active: boolean;

  @AllowNull(false)
  @ForeignKey(() => PlatformFeatureCategoryModel)
  @Column(DataType.INTEGER)
  category_id: number;

  // Only using this for JP sites scrapper
  @AllowNull(true)
  @Default(null)
  @Column(DataType.TEXT)
  temp_names: string;

  @Column(DataType.INTEGER)
  created_by: number;

  @CreatedAt
  @Default(Sequelize.fn('NOW'))
  @Column(DataType.DATE)
  created_at: Date;

  //
  // Relation/Association between the other tables

  @BelongsTo(() => PlatformFeatureCategoryModel)
  category: PlatformFeatureCategoryModel;
}
