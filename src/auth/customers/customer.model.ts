import {
  AllowNull,
  AutoIncrement,
  Column,
  CreatedAt,
  DataType,
  Default,
  HasOne,
  Index,
  Model,
  PrimaryKey,
  Sequelize,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

import { UserModel } from '../users/user.model';
import { ICustomerEntity } from './interfaces/customer.interface';

/**
 * Sequelize model
 * @export
 * @class Customer
 * @extends {Model<CustomerModel>}
 */
@Table({
  modelName: 'CustomerModel',
  tableName: 'customers',
})
export class CustomerModel extends Model<ICustomerEntity> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @Index
  id: number;

  @AllowNull(true)
  @Column(DataType.STRING)
  stripe_customer_id: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  card_last_digits: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  card_brand_name: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  card_holder_name: string;

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
}
