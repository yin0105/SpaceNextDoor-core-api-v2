import { PLATFORM_FEATURE_REPOSITORY } from '../../shared/constant/app.constant';
import { PlatformFeatureModel } from './feature.model';

export const platformFeatureProvider = [
  {
    provide: PLATFORM_FEATURE_REPOSITORY,
    useValue: PlatformFeatureModel,
  },
];
