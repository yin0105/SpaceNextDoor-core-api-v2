import { Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { Sequelize } from 'sequelize';

import {
  CUSTOMER_REPOSITORY,
  PROVIDER_REPOSITORY,
  SEQUELIZE_PROVIDER,
  USER_REPOSITORY,
} from '../../shared/constant/app.constant';
import { StripeService } from '../../stripe/stripe.service';
import { CustomerModel } from '../customers/customer.model';
import { ProviderModel } from '../providers/provider.model';
import { UserModel } from './user.model';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let sequelize: Sequelize;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        UserService,
        {
          provide: USER_REPOSITORY,
          useValue: UserModel,
        },
        {
          provide: CUSTOMER_REPOSITORY,
          useValue: CustomerModel,
        },
        {
          provide: PROVIDER_REPOSITORY,
          useValue: ProviderModel,
        },
        {
          provide: StripeService,
          useValue: {
            getStripeCustomerId: jest.fn(),
            upsertStripeCustomerSource: jest.fn(),
          },
        },
        {
          provide: SEQUELIZE_PROVIDER,
          useValue: {
            transaction: jest.fn(() => ({
              commit: jest.fn(),
              rollback: jest.fn(),
            })),
          },
        },
        Logger,
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    sequelize = module.get<Sequelize>(SEQUELIZE_PROVIDER);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upsert user', () => {
    it('should update existing user if it exists', async () => {
      const spy = jest
        .spyOn(UserModel, 'findOne')
        .mockResolvedValue({ id: 2 } as any);
      const updateSpy = jest
        .spyOn(UserModel, 'update')
        .mockResolvedValue({} as any);
      const result = await service.upsert({ username: '+66640359454' });

      expect(result.id).toEqual(2);
      expect(spy).toHaveBeenCalled();
      expect(updateSpy).toHaveBeenCalled();
    });

    it('should create user if it doest not exists', async () => {
      const t = { commit: jest.fn() };
      const txSpy = jest
        .spyOn(sequelize, 'transaction')
        .mockResolvedValue(t as any);
      const userSpy = jest.spyOn(UserModel, 'findOne').mockResolvedValue(null);
      const customerSpy = jest
        .spyOn(CustomerModel, 'create')
        .mockResolvedValue({ id: 1 } as any);
      const providerSpy = jest
        .spyOn(ProviderModel, 'create')
        .mockResolvedValue({ id: 1 } as any);
      const createUserSpy = jest
        .spyOn(UserModel, 'create')
        .mockResolvedValue({ id: 2 } as any);
      const result = await service.upsert({ username: '+66640359454' });

      expect(result.id).toEqual(2);
      expect(userSpy).toHaveBeenCalled();
      expect(customerSpy).toHaveBeenCalled();
      expect(providerSpy).toHaveBeenCalled();
      expect(txSpy).toHaveBeenCalled();
      expect(t.commit).toHaveBeenCalled();
      expect(createUserSpy).toHaveBeenCalled();
    });
  });
});
