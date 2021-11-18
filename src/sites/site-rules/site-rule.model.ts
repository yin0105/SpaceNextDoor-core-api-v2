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

import { PlatformRuleModel } from '../../platform/rules/rule.model';
import { SiteModel } from '../sites/site.model';
import { ISiteRuleEntity } from './interfaces/site-rule.interface';

/**
 * Sequelize model
 * @export
 * @class SiteRule
 * @extends {Model<ISiteRuleEntity>}
 */
@Table({
  modelName: 'SiteRuleModel',
  tableName: 'site_rules',
  updatedAt: false,
})
export class SiteRuleModel extends Model<ISiteRuleEntity> {
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
  @ForeignKey(() => PlatformRuleModel)
  @Column(DataType.INTEGER)
  rule_id: number;

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

  @BelongsTo(() => PlatformRuleModel)
  rule: PlatformRuleModel;
}
