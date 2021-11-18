import { IBookingHistoryEntity } from './interfaces/booking-history.interface';

export const bookingHistorySeed: Omit<
  IBookingHistoryEntity,
  'created_at' | 'updated_at'
> = {
  id: 1,
  status: 'RESERVED',
  note: 'Your booking has been reserved',
  changed_by: 1,
  booking_id: 1,
};

export const bookingHistoryPayload: Omit<
  IBookingHistoryEntity,
  'created_at' | 'updated_at' | 'id'
> = {
  status: 'RESERVED',
  note: 'Your booking has been reserved',
  changed_by: 1,
  booking_id: 1,
};
