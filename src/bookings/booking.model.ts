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
  HasOne,
  Index,
  Model,
  PrimaryKey,
  Sequelize,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

import { AppliedTaxModel } from '../applied-taxes/applied-tax.model';
import { UserModel } from '../auth/users/user.model';
import { IBookingEntity } from '../bookings/interfaces/booking.interface';
import {
  AppliedTax,
  BookingStatus,
  ReviewStatus,
  SpaceSizeUnit,
} from '../graphql.schema';
import { OrderModel } from '../orders/order.model';
import { PlatformInsuranceModel } from '../platform/insurances/insurance.model';
import { QuotationItemModel } from '../quotations/models/quotation-item.model';
import { RefundModel } from '../refunds/refund.model';
import { SiteModel } from '../sites/sites/site.model';
import { SpaceModel } from '../spaces/spaces/space.model';
import { TerminationModel } from '../terminations/termination.model';
import { BookingCancellationReasonsModel } from './booking-cancellation-reasons/booking-cancellation-reasons.model';
import { BookingHistoryModel } from './booking-history/booking-history.model';
import { BookingSiteAddressModel } from './booking-site-addresses/booking-site-address.model';
import { BookingSiteFeatureModel } from './booking-site-features/booking-site-feature.model';
import { BookingSpaceFeatureModel } from './booking-space-features/booking-space-feature.model';
import { BookingPromotionModel } from './promotions/promotion/promotion.model';
import { RenewalModel } from './renewals/renewal.model';
import { TransactionModel } from './transactions/transaction.model';

@Table({
  modelName: 'BookingModel',
  tableName: 'bookings',
})
export class BookingModel extends Model<IBookingEntity> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @Index
  id: number;

  @Column(DataType.STRING(50))
  customer_name: string;

  @Column(DataType.STRING(50))
  customer_email: string;

  @Column(DataType.STRING(20))
  customer_phone_number: string; // with country code like +92

  @AllowNull(false)
  @Column(DataType.DATE)
  move_in_date: Date;

  @AllowNull(true)
  @Column(DataType.STRING)
  unit_id: string;

  @AllowNull(true)
  @Column(DataType.DATE)
  move_out_date: Date;

  @AllowNull(true)
  @Column(DataType.FLOAT)
  commitment_months: number;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  auto_renewal: boolean;

  @AllowNull(true)
  @Column(DataType.FLOAT)
  space_size: number;

  @AllowNull(true)
  @Column(DataType.FLOAT)
  space_height: number;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  is_deposit_refunded: boolean;

  @AllowNull(true)
  @Default(null)
  @Column(DataType.DATE)
  deposit_refunded_date: Date;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  deposited_amount: number;

  @AllowNull(true)
  @Default(0)
  @Column(DataType.FLOAT)
  insurance_amount: number;

  @AllowNull(true)
  @Column(DataType.FLOAT)
  space_width: number;

  @AllowNull(true)
  @Column(DataType.FLOAT)
  space_length: number;

  @AllowNull(true)
  @Column(
    DataType.ENUM(SpaceSizeUnit.sqm, SpaceSizeUnit.sqft, SpaceSizeUnit.tatami),
  )
  space_size_unit: SpaceSizeUnit;

  @AllowNull(true)
  @Column(DataType.FLOAT)
  space_price_per_month: number;

  @AllowNull(false)
  @Column(DataType.STRING(20))
  currency: string;

  @AllowNull(false)
  @Column(DataType.STRING(5))
  currency_sign: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  site_name: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  short_id: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  site_description: string;

  @AllowNull(false)
  @ForeignKey(() => SiteModel)
  @Column(DataType.INTEGER)
  site_id: number;

  @AllowNull(false)
  @ForeignKey(() => SpaceModel)
  @Column(DataType.INTEGER)
  space_id: number;

  @AllowNull(true)
  @ForeignKey(() => PlatformInsuranceModel)
  @Column(DataType.INTEGER)
  insurance_id: number;

  @AllowNull(true)
  @ForeignKey(() => QuotationItemModel)
  @Column(DataType.INTEGER)
  quotation_item_id: number;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  is_insured: boolean;

  @AllowNull(false)
  @Default(BookingStatus.RESERVED)
  @Column(
    DataType.ENUM(
      BookingStatus.ACTIVE,
      BookingStatus.CANCELLED,
      BookingStatus.COMPLETED,
      BookingStatus.CONFIRMED,
      BookingStatus.RESERVED,
      BookingStatus.TERMINATED,
    ),
  )
  status: BookingStatus;

  @AllowNull(true)
  @ForeignKey(() => BookingCancellationReasonsModel)
  @Column(DataType.INTEGER)
  cancellation_reason_id: number;

  @Default('')
  @AllowNull(true)
  @Column(DataType.TEXT)
  cancellation_reason_note: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  is_reviewed: string;

  @Default(null)
  @AllowNull(true)
  @Column(
    DataType.ENUM(
      ReviewStatus.REMINDED,
      ReviewStatus.SCHEDULED,
      ReviewStatus.REVIEWED,
    ),
  )
  review_status: ReviewStatus; // at the time of active or moved in

  @AllowNull(false)
  @ForeignKey(() => UserModel)
  @Column(DataType.INTEGER)
  customer_id: number;

  @AllowNull(false)
  @ForeignKey(() => UserModel)
  @Column(DataType.INTEGER)
  provider_id: number;

  @AllowNull(true)
  @ForeignKey(() => BookingSiteAddressModel)
  @Column(DataType.INTEGER)
  site_address_id: number;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  base_amount: number;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  original_base_amount: number;

  @Default(0)
  @Column(DataType.FLOAT)
  total_tax_amount: number; // at the time of booking

  // total payable amount
  @AllowNull(false)
  @Column(DataType.FLOAT)
  total_amount: number; // total amount inclusive of discount + services + taxes

  @AllowNull(false)
  @Default(0)
  @Column(DataType.FLOAT)
  discount_amount: number;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  sub_total_amount: number; // total amount exclusive of discount + services

  @Default(false)
  @Column(DataType.BOOLEAN)
  is_termination_requested: boolean;

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

  @BelongsTo(() => PlatformInsuranceModel)
  insurance: PlatformInsuranceModel;

  @BelongsTo(() => SiteModel)
  site: SiteModel;

  @BelongsTo(() => BookingSiteAddressModel)
  site_address: BookingSiteAddressModel;

  @HasMany(() => BookingSpaceFeatureModel)
  space_features: BookingSpaceFeatureModel[];

  @HasMany(() => RenewalModel)
  renewals: RenewalModel[];

  @HasMany(() => TransactionModel)
  transactions: TransactionModel[];

  @HasMany(() => OrderModel)
  orders: OrderModel[];

  @HasMany(() => BookingSiteFeatureModel)
  site_features: BookingSiteFeatureModel[];

  @HasMany(() => BookingHistoryModel)
  bookings_history: BookingHistoryModel[];

  @HasMany(() => BookingPromotionModel)
  promotions: BookingPromotionModel[];

  @BelongsTo(() => SpaceModel)
  space: SpaceModel;

  @HasOne(() => TerminationModel)
  termination: TerminationModel;

  @HasOne(() => RefundModel)
  refund: RefundModel;

  @BelongsTo(() => BookingCancellationReasonsModel, {
    foreignKey: 'cancellation_reason_id',
  })
  cancellation_reason: BookingCancellationReasonsModel;

  @BelongsTo(() => QuotationItemModel)
  quotation_item: QuotationItemModel;

  @BelongsTo(() => UserModel, { as: 'customer', foreignKey: 'customer_id' })
  customer: UserModel;

  @BelongsTo(() => UserModel, { as: 'provider', foreignKey: 'provider_id' })
  provider: UserModel;

  @HasMany(() => AppliedTaxModel)
  applied_taxes: AppliedTax[];
}
