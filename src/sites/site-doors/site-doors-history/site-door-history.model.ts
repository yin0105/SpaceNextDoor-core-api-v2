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

import { UserModel } from '../../../auth/users/user.model';
import { BookingModel } from '../../../bookings/booking.model';
import { DoorActionType } from '../../../graphql.schema';
import { ISiteDoorHistoryEntity } from '../interfaces/site-door.interface';
import { SiteDoorModel } from '../site-door.model';

@Table({
  modelName: 'SiteDoorHistoryModel',
  tableName: 'site_doors_history',
  updatedAt: false,
})
export class SiteDoorHistoryModel extends Model<ISiteDoorHistoryEntity> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @Index
  id: number;

  @AllowNull(false)
  @ForeignKey(() => SiteDoorModel)
  @Column(DataType.INTEGER)
  site_door_id: number;

  @AllowNull(false)
  @ForeignKey(() => BookingModel)
  @Column(DataType.INTEGER)
  booking_id: number;

  @AllowNull(false)
  @Column(DataType.ENUM(DoorActionType.CLOSE, DoorActionType.OPEN))
  action: DoorActionType;

  @ForeignKey(() => UserModel)
  @Column(DataType.INTEGER)
  user_id: number;

  @AllowNull(true)
  @Column(DataType.STRING)
  user_ip: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  user_agent: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  user_device: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  platform: string;

  @CreatedAt
  @Default(Sequelize.fn('NOW'))
  @Column(DataType.DATE)
  created_at: Date;

  //
  // Relation/Association between the other tables
  @BelongsTo(() => SiteDoorModel)
  site_door: SiteDoorModel;

  @BelongsTo(() => UserModel)
  user: UserModel;

  @BelongsTo(() => BookingModel)
  booking: BookingModel;
}
