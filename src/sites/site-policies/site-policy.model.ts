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

import { PlatformPolicyModel } from '../../platform/policies/policy.model';
import { SiteModel } from '../sites/site.model';
import { ISitePolicyEntity } from './interfaces/site-policy.interface';

/**
 * Sequelize model
 * @export
 * @class SitePolicy
 * @extends {Model<ISitePolicyEntity>}
 */
@Table({
  modelName: 'SitePolicyModel',
  tableName: 'site_policies',
  updatedAt: false,
})
export class SitePolicyModel extends Model<ISitePolicyEntity> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @Index
  id: number;

  @AllowNull(false)
  @ForeignKey(() => SiteModel)
  @Column(DataType.INTEGER)
  site_id: number;

  @AllowNull(false)
  @ForeignKey(() => PlatformPolicyModel)
  @Column(DataType.INTEGER)
  policy_id: number;

  @Column(DataType.INTEGER)
  created_by: number;

  @CreatedAt
  @Default(Sequelize.fn('NOW'))
  @Column(DataType.DATE)
  created_at: Date;

  //
  // Relation/Association between the other tables

  @BelongsTo(() => SiteModel)
  site: SiteModel;

  @BelongsTo(() => PlatformPolicyModel)
  policy: PlatformPolicyModel;
}
