import { QuotationStatus } from '../../graphql.schema';

export interface IQuotationEntity {
  id: number;
  uuid: string;
  status: QuotationStatus;
  move_in_date: Date;
  move_out_date?: Date;
  user_id: number;
  promotion_id?: number;
  public_promotion_id?: number;
  created_at: Date;
  expired_at?: Date;
  country_id?: number;
}

export interface IQuotationItemEntity {
  id: number;
  quotation_id: number;
  site_id: number;
  space_id: number;
  booking_id?: number;
  price_per_month: number;
  created_at: Date;
}

export interface IQuotationArgs {
  uuid?: string;
  spaceId?: number;
  siteId?: number;
  userId?: number;
}

export interface IQuotationUpdate {
  status: QuotationStatus;
  expired_at?: Date;
}

export interface IQuotationEmailArgs {
  rejectDays?: number;
  reminderDays?: number;
}
