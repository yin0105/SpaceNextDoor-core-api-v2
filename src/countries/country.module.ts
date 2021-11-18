import { Logger, Module } from '@nestjs/common';

import { DbModule } from '../db/db.module';
import { CityModule } from './cities/city.module';
import { cityProvider } from './cities/city.provider';
import { CityService } from './cities/city.service';
import { countryProvider } from './country.provider';
import { CountryResolver } from './country.resolver';
import { CountryService } from './country.service';
import { LandmarkModule } from './landmarks/landmark.module';

@Module({
  imports: [DbModule, CityModule, LandmarkModule],
  providers: [
    ...countryProvider,
    ...cityProvider,
    CountryResolver,
    CityService,
    CountryService,
    Logger,
  ],
  exports: [CountryService],
})
export class CountryModule {}
