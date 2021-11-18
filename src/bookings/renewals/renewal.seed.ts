import { RenewalStatus, RenewalType } from '../../graphql.schema';
import { IRenewalEntity } from './interfaces/renewal.interface';

export const renewalPayload: Omit<
  IRenewalEntity,
  'created_at' | 'updated_at' | 'id'
> = {
  status: RenewalStatus.UN_PAID,
  type: RenewalType.BOOKING,
  booking_id: 1,
  base_amount: 12,
  transaction_id: 1,
  renewal_start_date: new Date(),
  renewal_end_date: new Date(),
  next_renewal_date: new Date(),
  discount_amount: 0,
  total_amount: 12,
  sub_total_amount: 12,
  total_tax_amount: 0,
};

export const renewalSeed: Omit<IRenewalEntity, 'created_at' | 'updated_at'> = {
  id: 1,
  status: RenewalStatus.UN_PAID,
  type: RenewalType.BOOKING,
  transaction_id: 1,
  booking_id: 1,
  next_renewal_date: new Date(),
  renewal_end_date: new Date(),
  renewal_start_date: new Date(),
  base_amount: 12,
  discount_amount: 0,
  total_amount: 12,
  sub_total_amount: 12,
  total_tax_amount: 0,
};
