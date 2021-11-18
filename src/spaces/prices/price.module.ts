import { Logger, Module } from '@nestjs/common';

import { DbModule } from '../../db/db.module';
import { priceProvider } from './price.provider';
import { PriceService } from './price.service';

@Module({
  imports: [DbModule],
  providers: [...priceProvider, PriceService, Logger],
  exports: [PriceService],
})
export class PriceModule {}
