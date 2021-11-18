import { PAYOUT_REPOSITORY } from '../shared/constant/app.constant';
import { PayoutModel } from './payout.model';

export const payoutProvider = [
  {
    provide: PAYOUT_REPOSITORY,
    useValue: PayoutModel,
  },
];
