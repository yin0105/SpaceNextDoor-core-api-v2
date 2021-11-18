import { BookingHistory } from '../../../graphql.schema';

export interface IBookingHistoryEntity extends BookingHistory {
  booking_id: number;
  changed_by: number;
}
