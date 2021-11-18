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
  Unique,
  UpdatedAt,
} from 'sequelize-typescript';

import { CustomerModel } from '../customers/customer.model';
import { ProviderModel } from '../providers/provider.model';
import { IUserEntity } from './interfaces/user.interface';

/**
 * Sequelize model
 * @export
 * @class User
 * @extends {Model<UserModel>}
 */
@Table({
  modelName: 'UserModel',
  tableName: 'users',
})
export class UserModel extends Model<IUserEntity> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @Index
  id: number;

  // @Unique
  // @AllowNull(false)
  // @Column(DataType.STRING(50))
  // @Index
  // username: string;

  @Unique
  @AllowNull(true)
  @ForeignKey(() => CustomerModel)
  @Column(DataType.INTEGER)
  @Index
  customer_id: number;

  @Unique
  @AllowNull(true)
  @ForeignKey(() => ProviderModel)
  @Column(DataType.INTEGER)
  @Index
  provider_id: number;

  @Column(DataType.STRING(50))
  first_name: string;

  @Column(DataType.STRING(50))
  last_name: string;

  @Column(DataType.STRING(50))
  email: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  stripe_customer_id: string;

  @AllowNull(false)
  @Default('en-US')
  @Column(DataType.STRING)
  preferred_language: string;

  @Column(DataType.STRING(20))
  phone_number: string; // with country code like +92

  @Column(DataType.STRING)
  image_url: string;

  @Column(DataType.ARRAY(DataType.STRING))
  roles: string[];

  @Default(false)
  @Column(DataType.BOOLEAN)
  is_email_verified: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  is_phone_verified: boolean;

  @Column(DataType.STRING)
  facebook_user_id: string;

  @Column(DataType.STRING)
  google_user_id: string;

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

  // Relation/Association between the other tables

  @BelongsTo(() => CustomerModel, { foreignKey: { allowNull: true } })
  customer: CustomerModel;

  @BelongsTo(() => ProviderModel, { foreignKey: { allowNull: true } })
  provider: ProviderModel;
}
