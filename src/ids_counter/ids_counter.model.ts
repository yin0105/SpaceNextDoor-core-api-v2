import {
  AutoIncrement,
  Column,
  DataType,
  Index,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';

/**
 * Sequelize model
 * @export
 * @class IDCounterModel
 * @extends {Model<IDCounterModel>}
 */
@Table({
  modelName: 'IDCounterModel',
  tableName: 'ids_counter',
})
export class IDCounterModel extends Model<IDCounterModel> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @Index
  id: number;

  @Column(DataType.INTEGER)
  last_id: number;

  @Unique
  @Column(DataType.STRING)
  @Index
  type: string; // BOOKING | ORDER
}
