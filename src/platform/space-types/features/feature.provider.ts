import { SPACE_TYPE_FEATURES_REPOSITORY } from '../../../shared/constant/app.constant';
import { SpaceTypeFeatureModel } from './feature.model';

export const spaceTypeFeatureProvider = [
  {
    provide: SPACE_TYPE_FEATURES_REPOSITORY,
    useValue: SpaceTypeFeatureModel,
  },
];
