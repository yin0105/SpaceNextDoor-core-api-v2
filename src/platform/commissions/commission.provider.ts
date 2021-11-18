import { PLATFORM_COMMISSION_REPOSITORY } from '../../shared/constant/app.constant';
import { PlatformCommissionModel } from './commission.model';

export const platformCommissionProvider = [
  {
    provide: PLATFORM_COMMISSION_REPOSITORY,
    useValue: PlatformCommissionModel,
  },
];
