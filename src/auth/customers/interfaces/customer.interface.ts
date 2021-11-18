import { Customer } from '../../../graphql.schema';

export interface ICustomerEntity extends Customer {
  id: number;
}
