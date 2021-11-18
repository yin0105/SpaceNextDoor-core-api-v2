import { PlatformService } from '../../../graphql.schema';

export interface IPlatformServiceEntity
  extends Omit<PlatformService, 'country'> {
  country_id: number;
}
