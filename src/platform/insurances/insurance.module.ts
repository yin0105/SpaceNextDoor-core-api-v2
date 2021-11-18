import { Logger, Module } from '@nestjs/common';

import { CountryModule } from '../../countries/country.module';
import { DbModule } from '../../db/db.module';
import { insuranceProvider } from './insurance.provider';
import { InsuranceResolver } from './insurance.resolver';
import { InsuranceService } from './insurance.service';

@Module({
  imports: [DbModule, CountryModule],
  providers: [
    InsuranceService,
    ...insuranceProvider,
    InsuranceResolver,
    Logger,
  ],
  exports: [InsuranceService, ...insuranceProvider],
})
export class PlatformInsuranceModule {}
