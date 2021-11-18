import { forwardRef, Logger, Module } from '@nestjs/common';

import { BookingModule } from '../../bookings/booking.module';
import { countryProvider } from '../../countries/country.provider';
import { DbModule } from '../../db/db.module';
import { PlatformSpaceTypeModule } from '../../platform/space-types/space-type.module';
import { PlatformSpaceTypeService } from '../../platform/space-types/space-type.service';
import { QuotationModule } from '../../quotations/quotation.module';
import { SiteModule } from '../../sites/sites/site.module';
import { siteProvider } from '../../sites/sites/site.provider';
import { PriceModule } from '../prices/price.module';
import { SpaceFeatureModule } from '../space-features/space-feature.module';
import { spaceProvider } from './space.provider';
import { SpaceResolver } from './space.resolver';
import { SpaceService } from './space.service';

@Module({
  imports: [
    DbModule,
    PriceModule,
    SpaceFeatureModule,
    forwardRef(() => SiteModule),
    forwardRef(() => BookingModule),
    forwardRef(() => PlatformSpaceTypeModule),
    forwardRef(() => QuotationModule),
  ],
  providers: [
    ...spaceProvider,
    ...siteProvider,
    ...countryProvider,
    SpaceResolver,
    SpaceService,
    PlatformSpaceTypeService,
    Logger,
  ],
  exports: [SpaceService, ...spaceProvider],
})
export class SpaceModule {}
