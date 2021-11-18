import { forwardRef, Logger, Module } from '@nestjs/common';

import { BookingModule } from '../bookings/booking.module';
import { ReviewResolver } from './review.resolver';
import { ReviewService } from './review.service';
import { YotPoReviewService } from './yotpo.service';

@Module({
  imports: [forwardRef(() => BookingModule)],
  providers: [ReviewService, YotPoReviewService, ReviewResolver, Logger],
  exports: [ReviewService],
})
export class ReviewModule {}
