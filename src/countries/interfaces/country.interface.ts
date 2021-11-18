import {
  City,
  Country,
  District,
  LocationLandmark,
} from '../../graphql.schema';

export interface ICountryEntity extends Omit<Country, 'cities'> {
  created_at: Date;
}

export interface ICityEntity extends Omit<City, 'districts'> {
  country_id: number;
  created_at: Date;
}

export interface IDistrictEntity extends District {
  city_id: number;
  created_at: Date;
}

export interface ILandmarkEntity extends LocationLandmark {
  district_id: number;
  created_at: Date;
}
