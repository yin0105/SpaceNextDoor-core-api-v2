import { Logger, Module } from '@nestjs/common';

import { DbModule } from '../../db/db.module';
import { bookingSpaceFeatureProvider } from './booking-space-feature.provider';
import { BookingSpaceFeatureService } from './booking-space-feature.service';

@Module({
  imports: [DbModule],
  providers: [
    ...bookingSpaceFeatureProvider,
    BookingSpaceFeatureService,
    Logger,
  ],
  exports: [BookingSpaceFeatureService],
})
export class BookingSpaceFeatureModule {}
