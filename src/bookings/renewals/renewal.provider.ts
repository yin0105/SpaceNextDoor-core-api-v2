import { RENEWAL_REPOSITORY } from '../../shared/constant/app.constant';
import { RenewalModel } from './renewal.model';

export const renewalProvider = [
  {
    provide: RENEWAL_REPOSITORY,
    useValue: RenewalModel,
  },
];
