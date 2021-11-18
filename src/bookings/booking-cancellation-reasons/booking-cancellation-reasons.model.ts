import {
  AllowNull,
  AutoIncrement,
  Column,
  CreatedAt,
  DataType,
  Default,
  Index,
  Model,
  PrimaryKey,
  Sequelize,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

import { IBookingCancellationEntity } from './interfaces/booking-cancellation-reasons.interface';

/**
 * Sequelize model
 * @export
 * @class BookingSiteFeature
 * @extends {Model<IBookingSiteFeatureEntity>}
 */
@Table({
  modelName: 'BookingCancellationReasonsModel',
  tableName: 'booking_cancellation_reasons',
})
export class BookingCancellationReasonsModel extends Model<IBookingCancellationEntity> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @Index
  id: number;

  @AllowNull(true)
  @Column(DataType.TEXT)
  description_en: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  description_th: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  description_jp: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  description_kr: string;

  @CreatedAt
  @Default(Sequelize.fn('NOW'))
  @Column(DataType.DATE)
  created_at: Date;

  @UpdatedAt
  @Default(Sequelize.fn('NOW'))
  @Column(DataType.DATE)
  updated_at: Date;
}
