import { Logger, Module } from '@nestjs/common';

import { BookingModule } from '../../bookings/booking.module';
import { DbModule } from '../../db/db.module';
import { SiteDoorResolver } from './site-door.resolver';
import { SiteDoorService } from './site-door.service';

@Module({
  imports: [DbModule, BookingModule],
  providers: [SiteDoorService, SiteDoorResolver, Logger],
  exports: [SiteDoorService],
})
export class SiteDoorModule {}
