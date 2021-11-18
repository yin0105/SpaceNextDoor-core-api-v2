import {
  AllowNull,
  AutoIncrement,
  Column,
  DataType,
  HasMany,
  Index,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

import { IPlatformSpaceCategoryEntity } from './interfaces/space-category.interface';
import { PlatformSpaceCategoryItemModel } from './items/space-category-item.model';

/**
 * Sequelize model
 * @export
 * @class PlatformSpaceCategory
 * @extends {Model<PlatformSpaceCategoryModel>}
 */
@Table({
  modelName: 'PlatformSpaceCategoryModel',
  tableName: 'platform_space_categories',
  updatedAt: false,
  createdAt: false,
})
export class PlatformSpaceCategoryModel extends Model<IPlatformSpaceCategoryEntity> {
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
  @Column(DataType.STRING)
  icon: string;

  //
  // Relation/Association between the other tables
  @HasMany(() => PlatformSpaceCategoryItemModel)
  items: PlatformSpaceCategoryItemModel;
}
