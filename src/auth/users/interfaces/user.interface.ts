import { User } from '../../../graphql.schema';

export interface IUserEntity extends Omit<User, 'provider' | 'customer'> {
  updated_by?: number;
  roles: string[];
}

export enum UserRoles {
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER',
  PROVIDER = 'PROVIDER',
}
