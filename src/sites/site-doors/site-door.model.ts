import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Index,
  Model,
  PrimaryKey,
  Sequelize,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

import { SiteModel } from '../sites/site.model';
import { ISiteDoorEntity } from './interfaces/site-door.interface';
import { SiteDoorHistoryModel } from './site-doors-history/site-door-history.model';

@Table({
  modelName: 'SiteDoorModel',
  tableName: 'site_doors',
  updatedAt: false,
})
export class SiteDoorModel extends Model<ISiteDoorEntity> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @Index
  id: number;

  @Column(DataType.STRING)
  name: string;

  @Column(DataType.STRING)
  description: string;

  @AllowNull(false)
  @ForeignKey(() => SiteModel)
  @Column(DataType.INTEGER)
  site_id: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  door_id: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  provider_id: string;

  @CreatedAt
  @Default(Sequelize.fn('NOW'))
  @Column(DataType.DATE)
  created_at: Date;

  @UpdatedAt
  @Default(Sequelize.fn('NOW'))
  @Column(DataType.DATE)
  updated_at: Date;

  // Relation/Association between the other tables
  @BelongsTo(() => SiteModel)
  site: SiteModel;

  @HasMany(() => SiteDoorHistoryModel)
  history: SiteDoorHistoryModel[];
}
