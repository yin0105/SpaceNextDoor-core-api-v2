import { Logger, Module } from '@nestjs/common';

import { RenewalModule } from '../bookings/renewals/renewal.module';
import { transactionProvider } from '../bookings/transactions/transaction.provider';
import { InvoiceResolver } from './invoice.resolver';
import { InvoiceService } from './invoice.service';
@Module({
  imports: [RenewalModule],
  providers: [InvoiceResolver, InvoiceService, Logger, ...transactionProvider],
  exports: [],
})
export class InvoiceModule {}
