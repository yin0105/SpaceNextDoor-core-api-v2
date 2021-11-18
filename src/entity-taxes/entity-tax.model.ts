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

import { PlatformInsuranceModel } from '../platform/insurances/insurance.model';
import { PlatformServiceModel } from '../platform/services/service.model';
import { PlatformTaxModel } from '../platform/taxes/tax.model';
import { SiteModel } from '../sites/sites/site.model';
import { IEntityTaxEntity } from './interfaces/entity-tax.interface';

@Table({
  modelName: 'EntityTaxModel',
  tableName: 'entity_taxes',
})
export class EntityTaxModel extends Model<IEntityTaxEntity> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @Index
  id: number;

  @AllowNull(false)
  @ForeignKey(() => PlatformTaxModel)
  @Column(DataType.INTEGER)
  tax_id: number;

  @Default(null)
  @ForeignKey(() => SiteModel)
  @Column(DataType.INTEGER)
  site_id: number;

  @Default(null)
  @ForeignKey(() => PlatformInsuranceModel)
  @Column(DataType.INTEGER)
  insurance_id: number;

  @Default(null)
  @ForeignKey(() => PlatformServiceModel)
  @Column(DataType.INTEGER)
  service_id: number;

  @Column(DataType.INTEGER)
  created_by: number;

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

  @BelongsTo(() => PlatformTaxModel)
  tax: PlatformTaxModel;

  @BelongsTo(() => SiteModel, { foreignKey: { allowNull: true } })
  site: SiteModel;

  @BelongsTo(() => PlatformInsuranceModel, { foreignKey: { allowNull: true } })
  insurance: PlatformInsuranceModel;

  @BelongsTo(() => PlatformServiceModel, { foreignKey: { allowNull: true } })
  service: PlatformServiceModel;
}
