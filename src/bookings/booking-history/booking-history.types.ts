import { IBookingHistoryEntity } from './interfaces/booking-history.interface';

export type BookingHistoryCreate = Omit<
  IBookingHistoryEntity,
  'id' | 'created_at' | 'updated_at'
>;
