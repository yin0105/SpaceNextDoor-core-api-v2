import { Logger, Module } from '@nestjs/common';

import { DbModule } from '../../db/db.module';
import { bookingHistoryProvider } from './booking-history.provider';
import { BookingHistoryService } from './booking-history.service';

@Module({
  imports: [DbModule],
  providers: [...bookingHistoryProvider, BookingHistoryService, Logger],
  exports: [BookingHistoryService],
})
export class BookingHistoryModule {}
