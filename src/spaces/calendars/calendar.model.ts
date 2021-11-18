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
  UpdatedAt,
} from 'sequelize-typescript';

import { SpaceModel } from '../spaces/space.model';
import { ICalendarEntity } from './interfaces/calendar.interface';

/**
 * Sequelize model
 * @export
 * @class Calendar
 * @extends {Model<ICalendarEntity>}
 */
@Table({
  modelName: 'CalendarModel',
  tableName: 'calendars',
})
export class CalendarModel extends Model<ICalendarEntity> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @Index
  id: number;

  @AllowNull(false)
  @ForeignKey(() => SpaceModel)
  @Column(DataType.INTEGER)
  space_id: number;

  @Column(DataType.DATE)
  start_date: Date;

  @Column(DataType.DATE)
  end_date: Date;

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

  @BelongsTo(() => SpaceModel)
  space: SpaceModel;
}
