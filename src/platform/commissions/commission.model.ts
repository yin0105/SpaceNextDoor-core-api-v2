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
  UpdatedAt,
} from 'sequelize-typescript';

import { SiteModel } from '../../sites/sites/site.model';
import { IPlatformCommissionEntity } from './interfaces/commission.interface';
/**
 * Sequelize model
 * @export
 * @class PlatformCommission
 * @extends {Model<PlatformCommission>}
 */
@Table({
  modelName: 'PlatformCommission',
  tableName: 'platform_commissions',
})
export class PlatformCommissionModel extends Model<IPlatformCommissionEntity> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @Index
  id: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  percentage: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  slug: string;

  @CreatedAt
  @Default(Sequelize.fn('NOW'))
  @Column(DataType.DATE)
  created_at: Date;

  @UpdatedAt
  @Default(Sequelize.fn('NOW'))
  @Column(DataType.DATE)
  updated_at: Date;

  // Relation/Association between the other tables

  @HasMany(() => SiteModel)
  sites: SiteModel;
}
