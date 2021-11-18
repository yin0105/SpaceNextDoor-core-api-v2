import { PLATFORM_SERVICE_REPOSITORY } from '../../shared/constant/app.constant';
import { PlatformServiceModel } from './service.model';

export const serviceProvider = [
  {
    provide: PLATFORM_SERVICE_REPOSITORY,
    useValue: PlatformServiceModel,
  },
];
