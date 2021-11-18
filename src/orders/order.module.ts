import { Logger, Module } from '@nestjs/common';

import { AppliedTaxModule } from '../applied-taxes/applied-tax.module';
import { AuthModule } from '../auth/auth.module';
import { BookingModule } from '../bookings/booking.module';
import { TransactionModule } from '../bookings/transactions/transaction.module';
import { DbModule } from '../db/db.module';
import { IDCounterModule } from '../ids_counter/ids_counter.module';
import { LogisticsModule } from '../logistics/logistics.module';
import { PlatformServiceModule } from '../platform/services/service.module';
import { StripeModule } from '../stripe/stripe.module';
import { OrderHistoryModule } from './order_history/order-history.module';
import { orderProvider } from './order.provider';
import { OrderResolver } from './order.resolver';
import { OrderService } from './order.service';
import { OrderPickUpServiceModule } from './pick_up_service/order-pick-up-service.module';

@Module({
  imports: [
    DbModule,
    LogisticsModule,
    OrderPickUpServiceModule,
    BookingModule,
    AuthModule,
    TransactionModule,
    PlatformServiceModule,
    StripeModule,
    OrderHistoryModule,
    IDCounterModule,
    AppliedTaxModule,
  ],
  providers: [...orderProvider, OrderService, OrderResolver, Logger],
  exports: [OrderService],
})
export class OrderModule {}
