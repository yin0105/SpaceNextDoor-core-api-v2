import { forwardRef, Logger, Module } from '@nestjs/common';

import { UserService } from '../auth/users/user.service';
import { BookingModule } from '../bookings/booking.module';
import { BookingPromotionModule } from '../bookings/promotions/promotion/promotion.module';
import { RenewalModule } from '../bookings/renewals/renewal.module';
import { transactionProvider } from '../bookings/transactions/transaction.provider';
import { TransactionService } from '../bookings/transactions/transaction.service';
import { DbModule } from '../db/db.module';
import { idCounterProvider } from '../ids_counter/ids_counter.provider';
import { IDCounterService } from '../ids_counter/ids_counter.service';
import { StripeService } from '../stripe/stripe.service';
import { terminationProvider } from './termination.provider';
import { TerminationResolver } from './termination.resolver';
import { TerminationService } from './termination.service';

@Module({
  imports: [
    DbModule,
    forwardRef(() => BookingModule),
    RenewalModule,
    BookingPromotionModule,
  ],
  providers: [
    TerminationService,
    ...terminationProvider,
    TerminationResolver,
    StripeService,
    ...transactionProvider,
    TransactionService,
    UserService,
    ...idCounterProvider,
    IDCounterService,
    Logger,
  ],
  exports: [TerminationService, ...terminationProvider],
})
export class TerminationModule {}
