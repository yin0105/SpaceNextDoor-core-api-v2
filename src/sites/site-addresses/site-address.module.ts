import { Logger, Module } from '@nestjs/common';

import { cityProvider } from '../../countries/cities/city.provider';
import { CityService } from '../../countries/cities/city.service';
import { countryProvider } from '../../countries/country.provider';
import { CountryService } from '../../countries/country.service';
import { districtProvider } from '../../countries/districts/district.provider';
import { DistrictService } from '../../countries/districts/district.service';
import { DbModule } from '../../db/db.module';
import { siteAddressProvider } from './site-address.provider';
import { SiteAddressResolver } from './site-address.resolver';
import { SiteAddressService } from './site-address.service';

@Module({
  imports: [DbModule],
  providers: [
    ...siteAddressProvider,
    ...countryProvider,
    CountryService,
    CityService,
    ...cityProvider,
    DistrictService,
    ...districtProvider,
    SiteAddressService,
    SiteAddressResolver,
    Logger,
  ],
  exports: [SiteAddressService],
})
export class SiteAddressModule {}
