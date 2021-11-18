import { TransactionType } from '../../../graphql.schema';

export interface ITransactionEntity {
  id: number;
  short_id?: string;
  invoice_id?: string;
  card_last_digits: string;
  card_brand_name?: string;
  amount: number;
  currency: string;
  created_at: Date;
  updated_at: Date;
  booking_id: number;
  stripe_charge_id: string;
  stripe_customer_id: string;
  order_id?: number;
  termination_id?: number;
  renewal_id?: number;
  refund_id?: number;
  type: TransactionType;
  user_id: number;
}
