import { TERMINATION_REPOSITORY } from '../shared/constant/app.constant';
import { TerminationModel } from './termination.model';

export const terminationProvider = [
  {
    provide: TERMINATION_REPOSITORY,
    useValue: TerminationModel,
  },
];
