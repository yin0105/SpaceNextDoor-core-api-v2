import { AppliedTax, CheckoutAppliedTax } from '../../graphql.schema';

export interface IAppliedTaxEntity extends AppliedTax {
  id: number;
  tax_id: number;
  booking_id: number;
  insurance_id?: number;
  renewal_id?: number;
  order_id?: number;
  order_pickup_service_id?: number;
  country_id: number;
  city_id?: number;
  created_by: number;
  updated_by: number;
  created_at: Date;
  updated_at: Date;
}

export interface IAppliedTaxPayload {
  tax_id: number;
  tax_amount: number;
  booking_id: number;
  insurance_id?: number;
  renewal_id?: number;
  order_id?: number;
  order_pickup_service_id?: number;
  transaction_id?: number;
}

export interface ICalculateTexResp {
  totalTax: number;
  taxes: CheckoutAppliedTax[];
}
