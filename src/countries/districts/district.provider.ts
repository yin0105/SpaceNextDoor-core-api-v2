import { DISTRICT_REPOSITORY } from '../../shared/constant/app.constant';
import { DistrictModel } from './district.model';

export const districtProvider = [
  {
    provide: DISTRICT_REPOSITORY,
    useValue: DistrictModel,
  },
];
