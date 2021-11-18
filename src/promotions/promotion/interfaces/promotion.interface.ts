import { Promotion } from '../../../graphql.schema';

export interface IPromotionEntity
  extends Omit<Promotion, 'customer_buys' | 'customer_gets'> {
  created_at: Date;
  updated_at: Date;
}

export interface ICreatePromotionArgs {
  user_id: number;
}

export interface IPromotionAmount {
  promotion: Promotion;
  public_promotion: Promotion;
  price_per_month: number;
  discounted_amount: number;
  total: number;
  total_after_discount: number;
  min_commitment_months?: number;
}
