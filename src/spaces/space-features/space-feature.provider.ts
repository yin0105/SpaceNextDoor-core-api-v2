import { SPACE_FEATURE_REPOSITORY } from '../../shared/constant/app.constant';
import { SpaceFeatureModel } from './space-feature.model';

export const spaceFeatureProvider = [
  {
    provide: SPACE_FEATURE_REPOSITORY,
    useValue: SpaceFeatureModel,
  },
];
