import { PLATFORM_PROPERTY_TYPE_REPOSITORY } from '../../shared/constant/app.constant';
import { PlatformPropertyTypeModel } from './property-type.model';

export const propertyTypeProvider = [
  {
    provide: PLATFORM_PROPERTY_TYPE_REPOSITORY,
    useValue: PlatformPropertyTypeModel,
  },
];
