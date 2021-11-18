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

import { CountryModel } from '../../countries/country.model';
import { SpaceSizeUnit } from '../../graphql.schema';
import { SpaceTypeFeatureModel } from './features/feature.model';
import { IPlatformSpaceTypeEntity } from './interfaces/space-type.interface';

/**
 * Sequelize model
 * @export
 * @class PlatformSpaceType
 * @extends {Model<PlatformSpaceTypeModel>}
 */
@Table({
  modelName: 'PlatformSpaceTypeModel',
  tableName: 'platform_space_types',
  updatedAt: false,
})
export class PlatformSpaceTypeModel extends Model<IPlatformSpaceTypeEntity> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @Index
  id: number;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  size_from: string;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  size_to: string;

  @AllowNull(false)
  @Column(
    DataType.ENUM(SpaceSizeUnit.sqm, SpaceSizeUnit.sqft, SpaceSizeUnit.tatami),
  )
  unit: SpaceSizeUnit;

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
  description_en: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  description_th: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  description_jp: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  description_kr: string;

  @Column(DataType.STRING)
  slug: string;

  @Column(DataType.STRING)
  icon: string;

  @AllowNull(false)
  @Default('')
  @Column(DataType.STRING)
  image: string;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  size: number;

  @AllowNull(false)
  @ForeignKey(() => CountryModel)
  @Column(DataType.INTEGER)
  country_id: number;

  @Column(DataType.INTEGER)
  created_by: number;

  @CreatedAt
  @Default(Sequelize.fn('NOW'))
  @Column(DataType.DATE)
  created_at: Date;

  //
  // Relation/Association between the other tables
  @BelongsTo(() => CountryModel)
  country: CountryModel;

  @HasMany(() => SpaceTypeFeatureModel)
  features: SpaceTypeFeatureModel[];
}
