import { PlatformRule } from '../../../graphql.schema';

export interface IPlatformRuleEntity extends PlatformRule {
  created_by: number;
  updated_by: number;
  created_at: Date;
  updated_at: Date;
}
