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

import { BookingModel } from '../bookings/booking.model';
import { RenewalModel } from '../bookings/renewals/renewal.model';
import { CityModel } from '../countries/cities/city.model';
import { CountryModel } from '../countries/country.model';
import { TaxEntityType, TaxType } from '../graphql.schema';
import { OrderModel } from '../orders/order.model';
import { OrderPickUpServiceModel } from '../orders/pick_up_service/order-pick-up-service.model';
import { PlatformInsuranceModel } from '../platform/insurances/insurance.model';
import { PlatformTaxModel } from '../platform/taxes/tax.model';
import { IAppliedTaxEntity } from './interfaces/applied-tax.interface';

@Table({
  modelName: 'AppliedTaxModel',
  tableName: 'applied_taxes',
})
export class AppliedTaxModel extends Model<IAppliedTaxEntity> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @Index
  id: number;

  @AllowNull(false)
  @ForeignKey(() => BookingModel)
  @Column(DataType.INTEGER)
  booking_id: number;

  @ForeignKey(() => PlatformTaxModel)
  @Column(DataType.INTEGER)
  tax_id: number;

  @AllowNull(true)
  @ForeignKey(() => PlatformInsuranceModel)
  @Column(DataType.INTEGER)
  insurance_id: number;

  @AllowNull(true)
  @ForeignKey(() => OrderModel)
  @Column(DataType.INTEGER)
  order_id: number;

  @AllowNull(true)
  @ForeignKey(() => OrderPickUpServiceModel)
  @Column(DataType.INTEGER)
  order_pickup_service_id: number;

  @AllowNull(true)
  @ForeignKey(() => RenewalModel)
  @Column(DataType.INTEGER)
  renewal_id: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  name_en: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  name_th: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  name_jp: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  name_kr: string;

  @AllowNull(false)
  @Default(TaxType.PERCENTAGE)
  @Column(DataType.ENUM(TaxType.ABSOLUTE, TaxType.PERCENTAGE))
  @Index
  type: TaxType;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  value: number;

  @Default(0)
  @Column(DataType.FLOAT)
  tax_amount: number;

  @AllowNull(false)
  @Column(
    DataType.ENUM(
      TaxEntityType.SITE,
      TaxEntityType.INSURANCE,
      TaxEntityType.SERVICE,
    ),
  )
  @Index
  entity_type: TaxEntityType;

  @AllowNull(false)
  @ForeignKey(() => CountryModel)
  @Column(DataType.INTEGER)
  country_id: number;

  @AllowNull(true)
  @ForeignKey(() => CityModel)
  @Column(DataType.INTEGER)
  city_id: number;

  @Default(false)
  @Column(DataType.BOOLEAN)
  is_default: boolean;

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

  @BelongsTo(() => PlatformTaxModel, { onDelete: 'SET NULL' })
  tax: PlatformTaxModel;

  @BelongsTo(() => BookingModel)
  booking: BookingModel;

  @BelongsTo(() => RenewalModel)
  renewal: RenewalModel;

  @BelongsTo(() => OrderModel)
  order: OrderModel;

  @BelongsTo(() => OrderPickUpServiceModel)
  orderPickUpService: OrderPickUpServiceModel;

  @BelongsTo(() => PlatformInsuranceModel)
  insurance: PlatformInsuranceModel;

  @BelongsTo(() => CountryModel)
  country: CountryModel;

  @BelongsTo(() => CityModel)
  city: CityModel;
}
