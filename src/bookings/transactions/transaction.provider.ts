import { TRANSACTION_REPOSITORY } from '../../shared/constant/app.constant';
import { TransactionModel } from './transaction.model';

export const transactionProvider = [
  {
    provide: TRANSACTION_REPOSITORY,
    useValue: TransactionModel,
  },
];
