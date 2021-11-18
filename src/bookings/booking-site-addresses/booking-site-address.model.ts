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

import { CityModel } from '../../countries/cities/city.model';
import { CountryModel } from '../../countries/country.model';
import { DistrictModel } from '../../countries/districts/district.model';
import { IBookingSiteAddressEntity } from './interfaces/booking-site-address.interface';

/**
 * Sequelize model
 * @export
 * @class BookingSiteAddress
 * @extends {Model<IBookingSiteAddressEntity>}
 */
@Table({
  modelName: 'BookingSiteAddressModel',
  tableName: 'booking_site_addresses',
})
export class BookingSiteAddressModel extends Model<IBookingSiteAddressEntity> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @Index
  id: number;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  lat: number;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  lng: number;

  @Default('')
  @Column(DataType.STRING)
  flat: string;

  @Default('')
  @Column(DataType.STRING)
  state: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  street: string;

  @Default('')
  @Column(DataType.STRING(10))
  postal_code: string;

  @AllowNull(false)
  @ForeignKey(() => CountryModel)
  @Column(DataType.INTEGER)
  country_id: number;

  @AllowNull(false)
  @ForeignKey(() => CityModel)
  @Column(DataType.INTEGER)
  city_id: number;

  @AllowNull(false)
  @ForeignKey(() => DistrictModel)
  @Column(DataType.INTEGER)
  district_id: number;

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

  @BelongsTo(() => CityModel)
  city: CityModel;

  @BelongsTo(() => DistrictModel, { foreignKey: { allowNull: true } })
  district: DistrictModel;
}
