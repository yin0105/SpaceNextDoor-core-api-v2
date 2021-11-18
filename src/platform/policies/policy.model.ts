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

import { PolicyType } from '../../graphql.schema';
import { IPlatformPolicyEntity } from './interfaces/policy.interface';

/**
 * Sequelize model
 * @export
 * @class PlatformPolicy
 * @extends {Model<PlatformPolicyModel>}
 */
@Table({
  modelName: 'PlatformPolicyModel',
  tableName: 'platform_policies',
})
export class PlatformPolicyModel extends Model<IPlatformPolicyEntity> {
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

  @Column(DataType.STRING)
  type: PolicyType;

  @Column(DataType.INTEGER)
  days: number;

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
}
