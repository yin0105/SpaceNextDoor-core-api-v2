import { PLATFORM_SPACE_CATEGORY_REPOSITORY } from '../../shared/constant/app.constant';
import { PlatformSpaceCategoryModel } from './space-category.model';

export const platformSpaceCategoryProvider = [
  {
    provide: PLATFORM_SPACE_CATEGORY_REPOSITORY,
    useValue: PlatformSpaceCategoryModel,
  },
];
