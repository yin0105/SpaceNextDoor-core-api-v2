import { Logger, Module } from '@nestjs/common';

import { cityProvider } from '../../countries/cities/city.provider';
import { CityService } from '../../countries/cities/city.service';
import { countryProvider } from '../../countries/country.provider';
import { CountryService } from '../../countries/country.service';
import { districtProvider } from '../../countries/districts/district.provider';
import { DistrictService } from '../../countries/districts/district.service';
import { DbModule } from '../../db/db.module';
import { bookingSiteAddressProvider } from './booking-site-address.provider';
import { BookingSiteAddressResolver } from './booking-site-address.resolver';
import { BookingSiteAddressService } from './booking-site-address.service';

@Module({
  imports: [DbModule],
  providers: [
    ...bookingSiteAddressProvider,
    ...countryProvider,
    CountryService,
    CityService,
    ...cityProvider,
    DistrictService,
    ...districtProvider,
    BookingSiteAddressService,
    BookingSiteAddressResolver,
    Logger,
  ],
  exports: [BookingSiteAddressService],
})
export class BookingSiteAddressModule {}
