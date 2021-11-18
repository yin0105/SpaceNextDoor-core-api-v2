import { Provider } from '../../../graphql.schema';

export interface IProviderEntity extends Omit<Provider, 'bank'> {
  bank_id: number;
}
