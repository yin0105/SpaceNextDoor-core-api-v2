import { PlatformInsurance } from '../../../graphql.schema';

export interface IPlatformInsuranceEntity
  extends Omit<PlatformInsurance, 'country'> {
  country_id: number;
}
