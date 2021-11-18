import { PLATFORM_SPACE_TYPE_REPOSITORY } from '../../shared/constant/app.constant';
import { PlatformSpaceTypeModel } from './space-type.model';

export const platformSpaceTypeProvider = [
  {
    provide: PLATFORM_SPACE_TYPE_REPOSITORY,
    useValue: PlatformSpaceTypeModel,
  },
];
