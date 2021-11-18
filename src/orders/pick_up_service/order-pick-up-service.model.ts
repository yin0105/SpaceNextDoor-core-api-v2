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

import { PlatformServiceModel } from '../../platform/services/service.model';
import { IOrderPickUpServiceEntity } from './interfaces/order-pick-up-service.interface';
/**
 * Sequelize model
 * @export
 * @class OrderPickUpService
 * @extends {Model<OrderPickUpService>}
 */
@Table({
  modelName: 'OrderPickUpServiceModel',
  tableName: 'orders_pick_up_service',
})
export class OrderPickUpServiceModel extends Model<IOrderPickUpServiceEntity> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @Index
  id: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  address: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  third_party_tracking_id: string;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  lat: number;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  lng: number;

  @AllowNull(false)
  @Column(DataType.DATE)
  pickup_time: Date;

  @AllowNull(false)
  @Column(DataType.STRING)
  currency: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  currency_sign: string;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  amount: number;

  @Default(0)
  @Column(DataType.FLOAT)
  tax_amount: number;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  discount_amount: number;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  total_amount: number;

  @AllowNull(true)
  @Default(0)
  @Column(DataType.INTEGER)
  mover_count: number;

  @AllowNull(false)
  @ForeignKey(() => PlatformServiceModel)
  @Column(DataType.INTEGER)
  service_id: number;

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

  @BelongsTo(() => PlatformServiceModel)
  service: PlatformServiceModel;
}
