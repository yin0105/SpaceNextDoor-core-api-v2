import { UserRoles } from '../../../auth/users/interfaces/user.interface';
import {
  CountryFilter,
  SortBy,
  Space,
  SpacePayload,
  SpaceStatus,
  StockManagementType,
} from '../../../graphql.schema';

export interface ISpaceEntity
  extends Omit<Space, 'features' | 'prices' | 'site'> {
  site_id: number;
  user_id: number;
  platform_space_type_id: number;
  created_by: number;
  updated_by: number;
}

export interface ICreateSpaceArgs {
  user_id: number;
  roles?: UserRoles[];
  isAdmin?: boolean;
  isHost?: boolean;
  currency?: string;
  currency_sign?: string;
}

export interface ICreateSpacePayload extends SpacePayload {
  available_units?: number;
  third_party_space_id?: string;
  platform_space_type_id?: number;
  stock_management_type?: StockManagementType;
  size?: number;
  status?: SpaceStatus;
}

export interface ISpaceFindAllSort {
  size?: SortBy;
  price?: SortBy;
}

interface IDateFilter {
  _eq?: Date;
}

interface INumberFilter {
  _eq?: number;
  _in?: number;
  _gt?: number;
  _lt?: number;
}

interface IStatusFilter {
  _eq?: SpaceStatus;
}

export interface ISpaceFindAllWhere {
  id?: INumberFilter;
  type_id?: INumberFilter;
  feature_id?: INumberFilter;
  available_units?: INumberFilter;
  status?: IStatusFilter;
  price?: INumberFilter;
  site_id?: INumberFilter;
  country?: CountryFilter;
  move_in_date?: IDateFilter;
  move_out_date?: IDateFilter;
}

export interface IMergeBookingResponse {
  start: Date;
  end: Date;
}
