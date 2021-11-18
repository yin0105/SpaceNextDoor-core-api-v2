import { Promotion } from '../../../../graphql.schema';

export interface IPromotionEntity
  extends Omit<Promotion, 'customer_buys' | 'customer_gets'> {
  promotion_id: number;
  applied_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface IBookingPromotion extends Promotion {
  promotion_id: number;
  promotion: Promotion;
  created_at: Date;
  updated_at: Date;
}

export interface IBookingPromotionAmount {
  promotion: IPromotionEntity; // voucher promotion
  public_promotion: IPromotionEntity; // public promotion
  price_per_month: number;
  discounted_amount: number;
  total: number;
  total_after_discount: number;
  min_commitment_months?: number;
}
