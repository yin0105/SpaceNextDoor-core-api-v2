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
import { BookingModel } from '../booking.model';
import { IBookingSiteFeatureEntity } from './interfaces/booking-site-feature.interface';

/**
 * Sequelize model
 * @export
 * @class BookingSiteFeature
 * @extends {Model<IBookingSiteFeatureEntity>}
 */
@Table({
  modelName: 'BookingSiteFeatureModel',
  tableName: 'booking_site_features',
})
export class BookingSiteFeatureModel extends Model<IBookingSiteFeatureEntity> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @Index
  id: number;

  @AllowNull(false)
  @ForeignKey(() => BookingModel)
  @Column(DataType.INTEGER)
  booking_id: number;

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

  @BelongsTo(() => BookingModel)
  booking: BookingModel;

  @BelongsTo(() => PlatformFeatureModel)
  feature: PlatformFeatureModel;
}
