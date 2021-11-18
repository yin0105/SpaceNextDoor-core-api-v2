import { IBookingEntity } from './interfaces/booking.interface';

export type BookingCreate = Omit<
  IBookingEntity,
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'status'
  | 'is_deposit_refunded'
  | 'deposit_refunded_date'
  | 'insurance_id'
  | 'is_insured'
  | 'insurance_amount'
>;
