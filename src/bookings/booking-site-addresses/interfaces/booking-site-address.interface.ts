import { BookingSiteAddress } from '../../../graphql.schema';

export interface IBookingSiteAddressEntity
  extends Omit<BookingSiteAddress, 'country' | 'city' | 'district'> {
  country_id: number;
  city_id: number;
  district_id: number;
}
