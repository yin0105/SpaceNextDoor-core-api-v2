import { IBookingSiteAddressEntity } from './interfaces/booking-site-address.interface';

export const bookingSiteAddressPayload: Omit<
  IBookingSiteAddressEntity,
  'created_at' | 'updated_at' | 'id'
> = {
  lat: 22.572646,
  lng: 88.363895,
  country_id: 1,
  city_id: 1,
  district_id: 1,
  postal_code: '486218',
  street: null,
  flat: '1',
};

export const bookingSiteAddressSeed: Omit<
  IBookingSiteAddressEntity,
  'created_at' | 'updated_at'
> = {
  id: 1,
  lat: 22.572646,
  lng: 88.363895,
  country_id: 1,
  city_id: 1,
  district_id: 1,
  postal_code: '486218',
  street: null,
  flat: '1',
};
