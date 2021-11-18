import { PLATFORM_FEATURE_CATEGORY_REPOSITORY } from '../../../shared/constant/app.constant';
import { PlatformFeatureCategoryModel } from './feature-category.model';

export const featureCategoryProvider = [
  {
    provide: PLATFORM_FEATURE_CATEGORY_REPOSITORY,
    useValue: PlatformFeatureCategoryModel,
  },
];
