import { SPACE_REPOSITORY } from '../../shared/constant/app.constant';
import { SpaceModel } from './space.model';

export const spaceProvider = [
  {
    provide: SPACE_REPOSITORY,
    useValue: SpaceModel,
  },
];
