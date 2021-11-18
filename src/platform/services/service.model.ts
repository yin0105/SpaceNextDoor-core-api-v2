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

import { CountryModel } from '../../countries/country.model';
import { EntityTaxModel } from '../../entity-taxes/entity-tax.model';
import {
  ServiceFrequency,
  ServiceStatus,
  ServiceType,
} from '../../graphql.schema';
import { IPlatformServiceEntity } from '../services/interfaces/service.interface';

@Table({
  modelName: 'PlatformService',
  tableName: 'platform_services',
})
export class PlatformServiceModel extends Model<IPlatformServiceEntity> {
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
  @Column(DataType.STRING)
  description_en: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  description_th: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  description_jp: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  description_kr: string;

  @AllowNull(true)
  @Default(null)
  @Column(DataType.STRING)
  vehicle_title: string; // "lorry 4" etc

  @AllowNull(true)
  @Default(null)
  @Column(DataType.STRING)
  vehicle_code: string; // "lorry 4" etc

  @AllowNull(true)
  @Column(DataType.STRING)
  icon: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  third_party_provider: string;

  @AllowNull(true)
  @Column(DataType.FLOAT)
  price_per_hour: number;

  @AllowNull(true)
  @Column(DataType.FLOAT)
  fixed_price: number;

  @AllowNull(false)
  @Column(DataType.ENUM(ServiceType.PICK_UP))
  type: ServiceType;

  @AllowNull(false)
  @Column(DataType.ENUM(ServiceFrequency.ONE_TIME, ServiceFrequency.RECURRING))
  frequency: ServiceFrequency;

  @AllowNull(true)
  @Default(null)
  @Column(DataType.FLOAT)
  max_weight: number;

  @AllowNull(true)
  @Default(null)
  @Column(DataType.STRING)
  weight_unit: string;

  @AllowNull(true)
  @Default(null)
  @Column(DataType.STRING)
  size_from: string; // "from XXS to XS" etc

  @AllowNull(false)
  @ForeignKey(() => CountryModel)
  @Column(DataType.INTEGER)
  country_id: number;

  @CreatedAt
  @Default(Sequelize.fn('NOW'))
  @Column(DataType.DATE)
  created_at: Date;

  @UpdatedAt
  @Default(Sequelize.fn('NOW'))
  @Column(DataType.DATE)
  updated_at: Date;

  @AllowNull(false)
  @Default(ServiceStatus.INACTIVE)
  @Column(DataType.ENUM(ServiceStatus.ACTIVE, ServiceStatus.INACTIVE))
  status: ServiceStatus;

  //
  // Relation/Association between the other tables

  @BelongsTo(() => CountryModel)
  country: CountryModel;

  @HasMany(() => EntityTaxModel)
  entity_taxes: EntityTaxModel[];
}
