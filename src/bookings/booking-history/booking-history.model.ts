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

import { UserModel } from '../../auth/users/user.model';
import { PlatformInsuranceModel } from '../../platform/insurances/insurance.model';
import { PromotionModel } from '../../promotions/promotion/promotion.model';
import { SpaceModel } from '../../spaces/spaces/space.model';
import { BookingModel } from '../booking.model';
import { IBookingHistoryEntity } from './interfaces/booking-history.interface';

@Table({
  modelName: 'BookingHistoryModel',
  tableName: 'bookings_history',
})
export class BookingHistoryModel extends Model<IBookingHistoryEntity> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @Index
  id: number;

  @AllowNull(false)
  @ForeignKey(() => BookingModel)
  @Column(DataType.INTEGER)
  booking_id: number;

  @AllowNull(true)
  @Column(DataType.STRING)
  status: string;

  @AllowNull(true)
  @Column(DataType.FLOAT)
  old_base_amount: number;

  @AllowNull(true)
  @Column(DataType.FLOAT)
  base_amount: number;

  @AllowNull(true)
  @Column(DataType.FLOAT)
  old_deposit: number;

  @AllowNull(true)
  @Column(DataType.FLOAT)
  new_deposit: number;

  @AllowNull(true)
  @ForeignKey(() => PlatformInsuranceModel)
  @Column(DataType.INTEGER)
  old_insurance_id: number;

  @AllowNull(true)
  @ForeignKey(() => PlatformInsuranceModel)
  @Column(DataType.INTEGER)
  insurance_id: number;

  @AllowNull(true)
  @ForeignKey(() => SpaceModel)
  @Column(DataType.INTEGER)
  old_space_id: number;

  @AllowNull(true)
  @ForeignKey(() => SpaceModel)
  @Column(DataType.INTEGER)
  new_space_id: number;

  // Promotions can be added later into ACTIVE bookings too
  @AllowNull(true)
  @ForeignKey(() => PromotionModel)
  @Column(DataType.INTEGER)
  promotion_id: number;

  @AllowNull(true)
  @ForeignKey(() => PromotionModel)
  @Column(DataType.INTEGER)
  public_promotion_id: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  note: string;

  @AllowNull(false)
  @ForeignKey(() => UserModel)
  @Column(DataType.INTEGER)
  changed_by: number;

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

  @BelongsTo(() => BookingModel)
  booking: BookingModel;

  @BelongsTo(() => PlatformInsuranceModel, {
    as: 'old_insurance',
    foreignKey: 'old_insurance_id',
  })
  old_insurance: PlatformInsuranceModel;

  @BelongsTo(() => PlatformInsuranceModel, {
    as: 'insurance',
    foreignKey: 'insurance_id',
  })
  insurance: PlatformInsuranceModel;

  @BelongsTo(() => SpaceModel, {
    as: 'old_space',
    foreignKey: 'old_space_id',
  })
  old_space: SpaceModel;

  @BelongsTo(() => SpaceModel, {
    as: 'new_space',
    foreignKey: 'new_space_id',
  })
  new_space: SpaceModel;

  @BelongsTo(() => PromotionModel, {
    as: 'promotion',
    foreignKey: 'promotion_id',
  })
  promotion: PromotionModel;

  @BelongsTo(() => PromotionModel, {
    as: 'public_promotion',
    foreignKey: 'public_promotion_id',
  })
  public_promotion: PromotionModel;

  @BelongsTo(() => UserModel)
  user: UserModel;
}
