import { Logger, Module } from '@nestjs/common';

import { DbModule } from '../../db/db.module';
import { districtProvider } from '../districts/district.provider';
import { DistrictService } from '../districts/district.service';
import { cityProvider } from './city.provider';
import { CityResolver } from './city.resolver';

@Module({
  imports: [DbModule],
  providers: [
    ...cityProvider,
    ...districtProvider,
    DistrictService,
    CityResolver,
    Logger,
  ],
  exports: [],
})
export class CityModule {}
