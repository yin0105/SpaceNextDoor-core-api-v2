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

import { UserModel } from '../users/user.model';
import { Platform } from './../auth.interface';
import { IRefreshTokenEntity } from './interfaces/refresh-token.interface';
/**
 * Sequelize model
 * @export
 * @class RefreshToken
 * @extends {Model<RefreshTokenModel>}
 */
@Table({
  modelName: 'RefreshTokenModel',
  tableName: 'refresh_tokens',
})
export class RefreshTokenModel extends Model<IRefreshTokenEntity> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @Index
  id: number;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  token_id: string;

  @AllowNull(false)
  @ForeignKey(() => UserModel)
  @Column(DataType.INTEGER)
  user_id: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  refresh_token_hash: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  refresh_token_expires_at: Date;

  @AllowNull(false)
  @Column(
    DataType.ENUM(
      Platform.IOS,
      Platform.WEB_DESKTOP,
      Platform.WEB_MOBILE,
      Platform.ANDROID,
    ),
  )
  platform: Platform;

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

  @BelongsTo(() => UserModel)
  user: UserModel;
}
