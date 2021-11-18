import { Renewal } from '../../../graphql.schema';

export interface IRenewalEntity extends Omit<Renewal, 'booking'> {
  booking_id: number;
  transaction_id: number;
  insurance_id?: number;
  promotion_id?: number;
  public_promotion_id?: number;
  booking_promotion_id?: number;
  booking_public_promotion_id?: number;
}

export interface IRenewalPayload
  extends Omit<IRenewalEntity, 'id' | 'created_at' | 'updated_at'> {
  next_renewal_sub_total: number;
}
