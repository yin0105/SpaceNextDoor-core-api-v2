import { Logger, Module } from '@nestjs/common';

import { transactionProvider } from './transaction.provider';
import { TransactionResolver } from './transaction.resolver';
import { TransactionService } from './transaction.service';
@Module({
  imports: [],
  providers: [
    TransactionService,
    Logger,
    ...transactionProvider,
    TransactionResolver,
  ],
  exports: [TransactionService, ...transactionProvider],
})
export class TransactionModule {}
