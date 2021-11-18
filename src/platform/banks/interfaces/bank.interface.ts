import { PlatformBank } from '../../../graphql.schema';

export interface IPlatformBankEntity extends PlatformBank {
  country_id: number;
}
