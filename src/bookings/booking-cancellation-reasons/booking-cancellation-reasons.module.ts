import { Logger, Module } from '@nestjs/common';

import { DbModule } from '../../db/db.module';
import { bookingCancellationReasonsProvider } from './booking-cancellation-reasons.provider';
import { BookingCancellationReasonsService } from './booking-cancellation-reasons.service';

@Module({
  imports: [DbModule],
  providers: [
    ...bookingCancellationReasonsProvider,
    BookingCancellationReasonsService,
    Logger,
  ],
  exports: [BookingCancellationReasonsService],
})
export class BookingCancellationReasonsModule {}
