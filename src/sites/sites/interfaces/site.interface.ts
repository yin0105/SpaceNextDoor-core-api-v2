import { UserRoles } from '../../../auth/users/interfaces/user.interface';
import {
  Site,
  SitePayload,
  SiteStatus,
  StockManagementType,
} from '../../../graphql.schema';

export interface ISiteEntity
  extends Omit<
    Site,
    'address' | 'rules' | 'features' | 'policies' | 'property_type' | 'spaces'
  > {
  property_type_id: number;
  agreement_id?: number;
  address_id: number;
  commission_id: number;
  user_id: number;
  created_by: number;
  updated_by: number;
}

export interface ICreateSiteArgs {
  user_id: number;
  roles?: UserRoles[];
  isAdmin?: boolean;
  isHost?: boolean;
  source_site_name?: string;
  country?: string;
}

export interface ICreateSitePayload extends SitePayload {
  status?: SiteStatus;
  third_party_site_id?: string;
  stock_management_type?: StockManagementType;
  images?: string[];
}

export interface ISitesArgs {
  user_id: number;
}
