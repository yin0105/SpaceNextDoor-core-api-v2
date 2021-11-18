import { Logger, Module } from '@nestjs/common';

import { DbModule } from '../../db/db.module';
import { districtProvider } from './district.provider';

@Module({
  imports: [DbModule],
  providers: [...districtProvider, Logger],
  exports: [],
})
export class DistrictModule {}
