import { PlatformPolicy } from '../../../graphql.schema';

export interface IPlatformPolicyEntity extends PlatformPolicy {
  created_by: number;
  updated_by: number;
  created_at: Date;
  updated_at: Date;
}
