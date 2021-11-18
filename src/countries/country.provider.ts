import { COUNTRY_REPOSITORY } from '../shared/constant/app.constant';
import { CountryModel } from './country.model';

export const countryProvider = [
  {
    provide: COUNTRY_REPOSITORY,
    useValue: CountryModel,
  },
];
