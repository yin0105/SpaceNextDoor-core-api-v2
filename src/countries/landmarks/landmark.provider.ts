import { LANDMARK_REPOSITORY } from '../../shared/constant/app.constant';
import { LandmarkModel } from './landmark.model';

export const landmarkProvider = [
  {
    provide: LANDMARK_REPOSITORY,
    useValue: LandmarkModel,
  },
];
