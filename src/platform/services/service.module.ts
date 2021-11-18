import { Logger, Module } from '@nestjs/common';

import { CountryModule } from '../../countries/country.module';
import { DbModule } from '../../db/db.module';
import { Service } from './service';
import { serviceProvider } from './service.provider';
import { ServiceResolver } from './service.resolver';

@Module({
  imports: [DbModule, CountryModule],
  providers: [Service, ...serviceProvider, ServiceResolver, Logger],
  exports: [Service],
})
export class PlatformServiceModule {}
