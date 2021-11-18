import { PLATFORM_SPACE_CATEGORY_ITEM_REPOSITORY } from '../../../shared/constant/app.constant';
import { PlatformSpaceCategoryItemModel } from './space-category-item.model';

export const platformSpaceCategoryItemProvider = [
  {
    provide: PLATFORM_SPACE_CATEGORY_ITEM_REPOSITORY,
    useValue: PlatformSpaceCategoryItemModel,
  },
];
