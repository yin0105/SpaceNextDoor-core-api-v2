import { Refund, RefundType } from '../../graphql.schema';

export interface IRefundEntity extends Omit<Refund, 'booking'> {
  booking_id: number;
  penalty_percent: number;
}

export interface IUnusedDaysOption {
  amount: number;
  chargeId: string;
}

export interface ICreateRefundOptions {
  bookingId: number;
  amount: number;
  chargeId: string;
  currency: string;
  type: RefundType;
  penaltyPercent: number;
}
