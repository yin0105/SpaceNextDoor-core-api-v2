import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Index,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

import { SpaceCategoryItemSizeUnit } from '../../../graphql.schema';
import { PlatformSpaceCategoryModel } from '../space-category.model';
import { IPlatformSpaceCategoryItemEntity } from './interfaces/space-category-item.interface';

/**
 * Sequelize model
 * @export
 * @class PlatformSpaceCategoryItem
 * @extends {Model<PlatformSpaceCategoryItemModel>}
 */
@Table({
  modelName: 'PlatformSpaceCategoryItemModel',
  tableName: 'platform_space_category_items',
  updatedAt: false,
  createdAt: false,
})
export class PlatformSpaceCategoryItemModel extends Model<IPlatformSpaceCategoryItemEntity> {
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

  @AllowNull(false)
  @Column(DataType.ENUM(SpaceCategoryItemSizeUnit.cm))
  unit: SpaceCategoryItemSizeUnit;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  height: number;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  width: number;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  dimension: number;

  @AllowNull(true)
  @Column(DataType.STRING)
  icon: string;

  @AllowNull(false)
  @ForeignKey(() => PlatformSpaceCategoryModel)
  @Column(DataType.INTEGER)
  category_id: number;

  //
  // Relation/Association between the other tables
  @BelongsTo(() => PlatformSpaceCategoryModel)
  category: PlatformSpaceCategoryModel;
}
