import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  HasOne,
  Index,
  Model,
  PrimaryKey,
  Sequelize,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

import { PlatformBankModel } from '../../platform/banks/bank.model';
import { UserModel } from '../users/user.model';
import { IProviderEntity } from './interfaces/provider.interface';

/**
 * Sequelize model
 * @export
 * @class Provider
 * @extends {Model<ProviderModel>}
 */
@Table({
  modelName: 'ProviderModel',
  tableName: 'providers',
})
export class ProviderModel extends Model<IProviderEntity> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @Index
  id: number;

  @Column(DataType.STRING(50))
  tax_id: string;

  @AllowNull(true)
  @ForeignKey(() => PlatformBankModel)
  @Column(DataType.INTEGER)
  bank_id: number;

  @AllowNull(true)
  @Column(DataType.STRING)
  bank_account_number: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  bank_account_holder_name: string;

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

  @HasOne(() => UserModel)
  user: UserModel;

  @BelongsTo(() => PlatformBankModel)
  bank: PlatformBankModel;
}
