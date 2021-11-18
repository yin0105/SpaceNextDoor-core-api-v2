import { forwardRef, Logger, Module } from '@nestjs/common';

import { UserService } from '../../auth/users/user.service';
import { BookingModule } from '../../bookings/booking.module';
import { countryProvider } from '../../countries/country.provider';
import { DbModule } from '../../db/db.module';
import { PlatformCommissionModule } from '../../platform/commissions/commission.module';
import { platformFeatureProvider } from '../../platform/features/feature.provider';
import { PlatformFeatureService } from '../../platform/features/feature.service';
import { PlatformSpaceTypeModule } from '../../platform/space-types/space-type.module';
import { QuotationModule } from '../../quotations/quotation.module';
import { ReviewModule } from '../../reviews/review.module';
import { priceProvider } from '../../spaces/prices/price.provider';
import { PriceService } from '../../spaces/prices/price.service';
import { spaceFeatureProvider } from '../../spaces/space-features/space-feature.provider';
import { SpaceFeatureService } from '../../spaces/space-features/space-feature.service';
import { spaceProvider } from '../../spaces/spaces/space.provider';
import { SpaceService } from '../../spaces/spaces/space.service';
import { StripeService } from '../../stripe/stripe.service';
import { SiteAddressModule } from '../site-addresses/site-address.module';
import { SiteFeatureModule } from '../site-features/site-feature.module';
import { SitePolicyModule } from '../site-policies/site-policy.module';
import { SiteRuleModule } from '../site-rules/site-rule.module';
import { siteProvider } from './site.provider';
import { SiteResolver } from './site.resolver';
import { SiteService } from './site.service';

@Module({
  imports: [
    DbModule,
    ReviewModule,
    QuotationModule,
    forwardRef(() => BookingModule),
    PlatformCommissionModule,
    SiteAddressModule,
    SiteRuleModule,
    SiteFeatureModule,
    SitePolicyModule,
    PlatformSpaceTypeModule,
  ],
  providers: [
    ...siteProvider,
    ...platformFeatureProvider,
    ...spaceProvider,
    ...priceProvider,
    ...spaceFeatureProvider,
    ...countryProvider,
    PriceService,
    SpaceFeatureService,
    SiteResolver,
    SiteService,
    SpaceService,
    PlatformFeatureService,
    StripeService,
    UserService,
    Logger,
  ],
  exports: [SiteService, ...siteProvider],
})
export class SiteModule {}
