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

import { BookingModel } from '../../bookings/booking.model';
import { SiteModel } from '../../sites/sites/site.model';
import { SpaceModel } from '../../spaces/spaces/space.model';
import { IQuotationItemEntity } from '../interfaces/quotation.interface';
import { QuotationModel } from './quotation.model';

@Table({
  modelName: 'QuotationItemModel',
  tableName: 'quotations_items',
  updatedAt: false,
})
export class QuotationItemModel extends Model<IQuotationItemEntity> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @Index
  id: number;

  @AllowNull(false)
  @ForeignKey(() => QuotationModel)
  @Column(DataType.INTEGER)
  quotation_id: number;

  @AllowNull(false)
  @ForeignKey(() => SiteModel)
  @Column(DataType.INTEGER)
  site_id: number;

  @AllowNull(false)
  @ForeignKey(() => SpaceModel)
  @Column(DataType.INTEGER)
  space_id: number;

  @AllowNull(true)
  @ForeignKey(() => BookingModel)
  @Column(DataType.INTEGER)
  booking_id: number;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  price_per_month: number;

  @CreatedAt
  @Default(Sequelize.fn('NOW'))
  @Column(DataType.DATE)
  created_at: Date;

  //
  // Relation/Association between the other tables
  @BelongsTo(() => SiteModel)
  site: SiteModel;

  @BelongsTo(() => SpaceModel)
  space: SpaceModel;

  @BelongsTo(() => QuotationModel)
  quotation: QuotationModel;
}
