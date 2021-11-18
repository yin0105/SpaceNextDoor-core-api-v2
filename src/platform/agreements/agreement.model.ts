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

import { CountryModel } from '../../countries/country.model';
import { IPlatformAgreementEntity } from './interfaces/agreement.interface';

@Table({
  modelName: 'PlatformAgreementModel',
  tableName: 'platform_agreements',
})
export class PlatformAgreementModel extends Model<IPlatformAgreementEntity> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @Index
  id: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  title_en: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  title_th: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  title_jp: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  title_kr: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  content_en: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  content_th: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  content_jp: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  content_kr: string;

  @AllowNull(false)
  @ForeignKey(() => CountryModel)
  @Column(DataType.INTEGER)
  country_id: number;

  @Default(false)
  @Column(DataType.BOOLEAN)
  is_default: boolean;

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
  @BelongsTo(() => CountryModel)
  country: CountryModel;
}
