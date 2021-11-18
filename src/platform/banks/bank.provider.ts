import { PLATFORM_BANK_REPOSITORY } from '../../shared/constant/app.constant';
import { PlatformBankModel } from './bank.model';

export const platformBankProvider = [
  {
    provide: PLATFORM_BANK_REPOSITORY,
    useValue: PlatformBankModel,
  },
];
