import { SiteAddress } from '../../../graphql.schema';

export interface ISiteAddressEntity
  extends Omit<SiteAddress, 'country' | 'city' | 'district'> {
  country_id: number;
  city_id: number;
  district_id: number;
  created_by: number;
  updated_by: number;
}

export interface ISiteAddressPoint {
  type: 'Point';
  coordinates: [number, number];
}
