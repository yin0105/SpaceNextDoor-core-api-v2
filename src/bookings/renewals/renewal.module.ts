import { forwardRef, Logger, Module } from '@nestjs/common';

import { AppliedTaxModule } from '../../applied-taxes/applied-tax.module';
import { BookingModule } from '../../bookings/booking.module';
import { DbModule } from '../../db/db.module';
import { PlatformInsuranceModule } from '../../platform/insurances/insurance.module';
import { PlatformServiceModule } from '../../platform/services/service.module';
import { PromotionModule } from '../../promotions/promotion/promotion.module';
import { SpaceModule } from '../../spaces/spaces/space.module';
import { renewalProvider } from './renewal.provider';
import { RenewalResolver } from './renewal.resolver';
import { RenewalService } from './renewal.service';

@Module({
  imports: [
    DbModule,
    SpaceModule,
    PromotionModule,
    PlatformServiceModule,
    forwardRef(() => BookingModule),
    PlatformInsuranceModule,
    AppliedTaxModule,
  ],
  providers: [...renewalProvider, RenewalService, Logger, RenewalResolver],
  exports: [RenewalService, ...renewalProvider],
})
export class RenewalModule {}
