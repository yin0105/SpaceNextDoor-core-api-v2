import { Logger, Module } from '@nestjs/common';

import { transactionProvider } from '../bookings/transactions/transaction.provider';
import { TransactionService } from '../bookings/transactions/transaction.service';
import { DbModule } from '../db/db.module';
import { idCounterProvider } from '../ids_counter/ids_counter.provider';
import { IDCounterService } from '../ids_counter/ids_counter.service';
import { StripeModule } from '../stripe/stripe.module';
import { refundProvider } from './refund.provider';
import { RefundService } from './refund.service';

@Module({
  imports: [StripeModule, DbModule],
  providers: [
    ...refundProvider,
    ...idCounterProvider,
    ...transactionProvider,
    RefundService,
    Logger,
    IDCounterService,
    TransactionService,
  ],
  exports: [RefundService],
})
export class RefundModule {}
