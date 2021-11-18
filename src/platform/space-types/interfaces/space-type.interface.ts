import { PlatformSpaceType } from '../../../graphql.schema';

export interface IPlatformSpaceTypeEntity
  extends Omit<PlatformSpaceType, 'country'> {
  country_id: number;
  created_by: number;
  created_at: Date;
}
