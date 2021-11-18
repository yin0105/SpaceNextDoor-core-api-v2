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
  UpdatedAt,
} from 'sequelize-typescript';

import { UserModel } from '../../auth/users/user.model';
import { BookingModel } from '../../bookings/booking.model';
import {
  SpaceSizeUnit,
  SpaceStatus,
  StockManagementType,
} from '../../graphql.schema';
import { PlatformSpaceTypeModel } from '../../platform/space-types/space-type.model';
import { SiteModel } from '../../sites/sites/site.model';
import { CalendarModel } from '../calendars/calendar.model';
import { PriceModel } from '../prices/price.model';
import { SpaceFeatureModel } from '../space-features/space-feature.model';

/**
 * Sequelize model
 * @export
 * @class Space
 * @extends {Model<SpaceModel>}
 */
@Table({
  modelName: 'SpaceModel',
  tableName: 'spaces',
})
export class SpaceModel extends Model<SpaceModel> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @Index
  id: number;

  @AllowNull(true)
  @Column(DataType.STRING)
  name: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  description: string;

  @AllowNull(true)
  @Column(DataType.ARRAY(DataType.TEXT))
  images: string[];

  @AllowNull(true)
  @Column(DataType.STRING)
  rejection_reason: string;

  @AllowNull(false)
  @Default(SpaceStatus.DRAFT)
  @Column(
    DataType.ENUM(
      SpaceStatus.ACTIVE,
      SpaceStatus.ARCHIVED,
      SpaceStatus.DRAFT,
      SpaceStatus.IN_ACTIVE,
      SpaceStatus.READY_TO_REVIEW,
      SpaceStatus.REJECTED,
    ),
  )
  status: SpaceStatus;

  @AllowNull(false)
  @ForeignKey(() => SiteModel)
  @Column(DataType.INTEGER)
  site_id: number;

  @AllowNull(false)
  @ForeignKey(() => UserModel)
  @Column(DataType.INTEGER)
  user_id: number;

  @AllowNull(true)
  @ForeignKey(() => PlatformSpaceTypeModel)
  @Column(DataType.INTEGER)
  platform_space_type_id: number;

  @AllowNull(true)
  @Column(DataType.FLOAT)
  size: number;

  @AllowNull(true)
  @Column(DataType.FLOAT)
  height: number;

  @AllowNull(true)
  @Column(DataType.FLOAT)
  width: number;

  @AllowNull(true)
  @Column(DataType.FLOAT)
  length: number;

  @AllowNull(true)
  @Column(
    DataType.ENUM(SpaceSizeUnit.sqm, SpaceSizeUnit.sqft, SpaceSizeUnit.tatami),
  )
  size_unit: SpaceSizeUnit;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  total_units: number;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  available_units: number;

  @AllowNull(true)
  @Column(
    DataType.ENUM(
      StockManagementType.SND,
      StockManagementType.THIRD_PARTY,
      StockManagementType.AFFILIATE,
    ),
  )
  @Index
  stock_management_type: StockManagementType;

  @AllowNull(true)
  @Column(DataType.STRING)
  third_party_space_id: string;

  @Column(DataType.INTEGER)
  created_by: number;

  @Column(DataType.INTEGER)
  updated_by: number;

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

  @BelongsTo(() => UserModel)
  user: UserModel;

  @BelongsTo(() => SiteModel)
  site: SiteModel;

  @BelongsTo(() => PlatformSpaceTypeModel)
  platform_space_type: PlatformSpaceTypeModel;

  @HasMany(() => SpaceFeatureModel)
  features: SpaceFeatureModel[];

  @HasMany(() => CalendarModel)
  calendars: CalendarModel[];

  @HasMany(() => PriceModel)
  prices: PriceModel[];

  @HasMany(() => BookingModel)
  bookings: BookingModel[];
}
