import { PlatformAgreement } from '../../../graphql.schema';

export interface IPlatformAgreementEntity extends PlatformAgreement {
  country_id: number;
  created_at: Date;
  updated_at: Date;
}
