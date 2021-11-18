import { Logger, Module } from '@nestjs/common';

import { AppliedTaxModule } from '../applied-taxes/applied-tax.module';
import { AuthModule } from '../auth/auth.module';
import { DbModule } from '../db/db.module';
import { IDCounterModule } from '../ids_counter/ids_counter.module';
import { LogisticsModule } from '../logistics/logistics.module';
import { OrderHistoryModule } from '../orders/order_history/order-history.module';
import { orderProvider } from '../orders/order.provider';
import { PlatformInsuranceModule } from '../platform/insurances/insurance.module';
import { PlatformServiceModule } from '../platform/services/service.module';
import { PromotionModule } from '../promotions/promotion/promotion.module';
import { PromotionRedeemModule } from '../promotions/redeem/redeem.module';
import { RefundModule } from '../refunds/refund.module';
import { SiteModule } from '../sites/sites/site.module';
import { siteProvider } from '../sites/sites/site.provider';
import { SpaceModule } from '../spaces/spaces/space.module';
import { spaceProvider } from '../spaces/spaces/space.provider';
import { StripeModule } from '../stripe/stripe.module';
import { TerminationModule } from '../terminations/termination.module';
import { BookingCancellationReasonsModule } from './booking-cancellation-reasons/booking-cancellation-reasons.module';
import { BookingHistoryModule } from './booking-history/booking-history.module';
import { BookingSiteAddressModule } from './booking-site-addresses/booking-site-address.module';
import { BookingSiteFeatureModule } from './booking-site-features/booking-site-feature.module';
import { BookingSpaceFeatureModule } from './booking-space-features/booking-space-feature.module';
import { bookingProvider } from './booking.provider';
import { BookingResolver } from './booking.resolver';
import { BookingService } from './booking.service';
import { BookingPromotionModule } from './promotions/promotion/promotion.module';
import { RenewalModule } from './renewals/renewal.module';
import { TransactionModule } from './transactions/transaction.module';

@Module({
  imports: [
    DbModule,
    BookingSpaceFeatureModule,
    BookingSiteFeatureModule,
    BookingSiteAddressModule,
    PlatformInsuranceModule,
    OrderHistoryModule,
    BookingHistoryModule,
    PlatformServiceModule,
    BookingCancellationReasonsModule,
    AuthModule,
    RefundModule,
    RenewalModule,
    IDCounterModule,
    StripeModule,
    TransactionModule,
    PromotionModule,
    BookingPromotionModule,
    PromotionRedeemModule,
    SiteModule,
    SpaceModule,
    TerminationModule,
    LogisticsModule,
    AppliedTaxModule,
  ],
  providers: [
    ...bookingProvider,
    ...siteProvider,
    ...spaceProvider,
    ...orderProvider,
    BookingResolver,
    BookingService,
    Logger,
  ],
  exports: [BookingService, ...bookingProvider],
})
export class BookingModule {}
