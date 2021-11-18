import { Logger, Module } from '@nestjs/common';

import { DbModule } from '../../db/db.module';
import { bookingSiteFeatureProvider } from './booking-site-feature.provider';
import { BookingSiteFeatureService } from './booking-site-feature.service';

@Module({
  imports: [DbModule],
  providers: [...bookingSiteFeatureProvider, BookingSiteFeatureService, Logger],
  exports: [BookingSiteFeatureService],
})
export class BookingSiteFeatureModule {}
