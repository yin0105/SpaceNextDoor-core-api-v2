import { PLATFORM_INSURANCE_REPOSITORY } from '../../shared/constant/app.constant';
import { PlatformInsuranceModel } from './insurance.model';

export const insuranceProvider = [
  {
    provide: PLATFORM_INSURANCE_REPOSITORY,
    useValue: PlatformInsuranceModel,
  },
];
