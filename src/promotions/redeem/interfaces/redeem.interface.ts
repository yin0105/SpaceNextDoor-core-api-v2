export interface IRedeemEntity {
  promotion_id: number;
  booking_id: number;
  booking_promotion_id: number;
  // order_id: number;
  renewal_id: number;
  customer_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateRedeemPayload {
  promotion_id: number;
  booking_promotion_id: number;
  booking_id: number;
  // order_id: number;
  renewal_id: number;
  customer_id: number;
}
