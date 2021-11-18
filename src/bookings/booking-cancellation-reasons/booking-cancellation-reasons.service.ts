import { Inject, Injectable, Logger } from '@nestjs/common';

import { CANCELLATION_REASONS_REPOSITORY } from '../../shared/constant/app.constant';
import { BookingCancellationReasonsModel } from './booking-cancellation-reasons.model';
import { IBookingCancellationEntity } from './interfaces/booking-cancellation-reasons.interface';

@Injectable()
export class BookingCancellationReasonsService {
  constructor(
    @Inject(CANCELLATION_REASONS_REPOSITORY)
    private readonly reasonsEntity: typeof BookingCancellationReasonsModel,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(BookingCancellationReasonsService.name);
  }

  async findAll(): Promise<IBookingCancellationEntity[]> {
    return this.reasonsEntity.findAll();
  }
}
