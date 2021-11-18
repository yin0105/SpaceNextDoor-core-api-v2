import { CITY_REPOSITORY } from '../../shared/constant/app.constant';
import { CityModel } from './city.model';

export const cityProvider = [
  {
    provide: CITY_REPOSITORY,
    useValue: CityModel,
  },
];
