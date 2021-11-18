import { Inject, Injectable, Logger } from '@nestjs/common';
import { Op, Transaction } from 'sequelize';

import { BookingHistory } from '../../graphql.schema';
import { BOOKING_HISTORY_REPOSITORY } from '../../shared/constant/app.constant';
import { BookingHistoryModel } from './booking-history.model';
import { IBookingHistoryEntity } from './interfaces/booking-history.interface';

@Injectable()
export class BookingHistoryService {
  constructor(
    @Inject(BOOKING_HISTORY_REPOSITORY)
    private readonly bookingHistoryEntity: typeof BookingHistoryModel,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(BookingHistoryService.name);
  }

  async getByBookingId(id: number): Promise<BookingHistory[]> {
    return await this.bookingHistoryEntity.findAll({
      where: {
        booking_id: { [Op.eq]: id },
      },
    });
  }

  async upsert(
    payload: Omit<IBookingHistoryEntity, 'id' | 'created_at' | 'updated_at'>,
    args?: { t: Transaction },
    id?: number,
  ): Promise<BookingHistory> {
    if (id) {
      await this.bookingHistoryEntity.update(payload, {
        where: { id: { [Op.eq]: id } },
        transaction: args.t,
      });
    }

    return await this.bookingHistoryEntity.create(payload, {
      transaction: args?.t,
    });
  }
}
