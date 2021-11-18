import { Payout } from '../../graphql.schema';

export interface IPayoutEntity extends Payout {
  renewal_id: number;
  booking_id: number;
  provider_id: number;
}
