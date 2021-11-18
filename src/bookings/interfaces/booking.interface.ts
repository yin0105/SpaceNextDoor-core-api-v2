import { UserRoles } from '../../auth/users/interfaces/user.interface';
import { Booking, BookingStatus } from '../../graphql.schema';

export interface IBookingEntity
  extends Omit<
    Booking,
    | 'site_address'
    | 'site_features'
    | 'space_features'
    | 'customer'
    | 'history'
    | 'insurance'
    | 'auth'
    | 'orders'
    | 'transactions'
    | 'renewals'
    | 'termination'
    | 'cancellation'
  > {
  site_id: number;
  customer_name: string;
  customer_email: string;
  cancellation_reason_id?: number;
  cancellation_reason_note?: string;
  insurance_id: number;
  customer_phone_number: string;
  unit_id?: string;
  space_id: number;
  site_address_id: number;
  customer_id: number;
  provider_id: number;
  quotation_item_id?: number;
}

export interface IBookingArgs {
  user_id: number;
  role: string;
  roles: UserRoles[];
  isAdmin: boolean;
  isHost: boolean;
  isCustomer: boolean;
}

export interface IBookingStatusFilter {
  _eq: BookingStatus;
}

export interface IBookingCreatedAtFilter {
  _gte?: Date;
  _lte?: Date;
}

export interface IBookingsFilter {
  status?: IBookingStatusFilter;
  created_at?: IBookingCreatedAtFilter;
  move_in_date?: IBookingCreatedAtFilter;
  move_out_date?: IBookingCreatedAtFilter;
}

export interface ICalculateTaxArgs {
  site_id?: number;
  insurance_id?: number;
  pickup_service_id?: number;
  space_price?: number;
  insurance_price?: number;
  pickup_service_price?: number;
}
