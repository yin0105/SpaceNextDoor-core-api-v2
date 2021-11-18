import {
  AutoIncrement,
  Column,
  CreatedAt,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Sequelize,
  Table,
} from 'sequelize-typescript';

import { IOTPEntity } from './interfaces/otp.interface';

@Table({
  tableName: 'otps',
  updatedAt: false,
})
export class OTP extends Model<IOTPEntity> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @Column(DataType.TEXT)
  otp_hash: string;

  @Column(DataType.TEXT)
  username: string;

  @Column(DataType.DATE)
  expires_at: Date;

  @CreatedAt
  @Default(Sequelize.fn('NOW'))
  @Column(DataType.DATE)
  created_at: Date;
}
