import { PlatformPropertyType } from '../../../graphql.schema';

export interface IPlatformPropertyTypeEntity extends PlatformPropertyType {
  created_by: number;
  created_at: Date;
}

export interface IGetPropertyTypeWhere {
  name?: string;
}
