import { IDS_COUNTER_REPOSITORY } from '../shared/constant/app.constant';
import { IDCounterModel } from './ids_counter.model';

export const idCounterProvider = [
  {
    provide: IDS_COUNTER_REPOSITORY,
    useValue: IDCounterModel,
  },
];
