import { PlatformTax } from '../../../graphql.schema';

export interface IPlatformTaxEntity extends PlatformTax {
  country_id: number;
  city_id?: number;
  created_by: number;
  updated_by: number;
  created_at: Date;
  updated_at: Date;
}
