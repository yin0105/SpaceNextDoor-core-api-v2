import { Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';

import { UserRoles } from '../../auth/users/interfaces/user.interface';
import { UserModel } from '../../auth/users/user.model';
import { UserService } from '../../auth/users/user.service';
import { ProviderType, SitePayload } from '../../graphql.schema';
import { CommissionService } from '../../platform/commissions/commission.service';
import { platformFeatureProvider } from '../../platform/features/feature.provider';
import { PlatformFeatureService } from '../../platform/features/feature.service';
import { PlatformTaxModel } from '../../platform/taxes/tax.model';
import {
  COUNTRY_REPOSITORY,
  ENTITY_TAX_REPOSITORY,
  PLATFORM_AGREEMENT_REPOSITORY,
  PLATFORM_TAX_REPOSITORY,
  SEQUELIZE_PROVIDER,
} from '../../shared/constant/app.constant';
import { SpaceService } from '../../spaces/spaces/space.service';
import { SiteAddressModel } from '../site-addresses/site-address.model';
import { siteAddressProvider } from '../site-addresses/site-address.provider';
import { SiteAddressService } from '../site-addresses/site-address.service';
import { SiteFeatureModel } from '../site-features/site-feature.model';
import { siteFeatureProvider } from '../site-features/site-feature.provider';
import { SiteFeatureService } from '../site-features/site-feature.service';
import { SitePolicyModel } from '../site-policies/site-policy.model';
import { sitePolicyProvider } from '../site-policies/site-policy.provider';
import { SitePolicyService } from '../site-policies/site-policy.service';
import { SiteRuleModel } from '../site-rules/site-rule.model';
import { siteRuleProvider } from '../site-rules/site-rule.provider';
import { SiteRuleService } from '../site-rules/site-rule.service';
import { SiteModel } from './site.model';
import { siteProvider } from './site.provider';
import { siteSeed } from './site.seed';
import { SiteService } from './site.service';

const payloadOriginal: SitePayload = {
  name: 'Site Name',
  rules_id: [1],
  policies_id: [1],
  features_id: [1],
  property_type_id: 1,
  provider_type: ProviderType.BUSINESS,
  address: {
    country_id: 1,
    city_id: 1,
    district_id: 1,
    lat: 1.3326153,
    lng: 103.892592,
    street: 'Test',
    postal_code: '12222',
  },
};

const userFound = {
  email: 'abc@gmail.com',
  first_name: 'foo',
};

describe('SiteService', () => {
  let service: SiteService;
  let payload;
  const userService: UserService = {
    findOne: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        ...siteProvider,
        ...siteAddressProvider,
        ...siteRuleProvider,
        ...siteFeatureProvider,
        ...sitePolicyProvider,
        ...platformFeatureProvider,
        SiteService,
        SiteAddressService,
        SiteRuleService,
        SitePolicyService,
        SiteFeatureService,
        PlatformFeatureService,
        {
          provide: CommissionService,
          useValue: { getDefaultCommission: jest.fn() },
        },
        {
          provide: UserService,
          useValue: userService,
        },
        {
          provide: SpaceService,
          useValue: { getActiveBookingsWhere: jest.fn() },
        },
        {
          provide: SpaceService,
          useValue: { getActiveBookingsWhere: jest.fn() },
        },
        {
          provide: PLATFORM_AGREEMENT_REPOSITORY,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: PLATFORM_TAX_REPOSITORY,
          useValue: {
            findAll: jest.fn(() => []),
          },
        },
        {
          provide: COUNTRY_REPOSITORY,
          useValue: {
            findOne: jest.fn(() => ({})),
          },
        },
        {
          provide: ENTITY_TAX_REPOSITORY,
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
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

    service = module.get<SiteService>(SiteService);
    payload = payloadOriginal;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validatePayload', () => {
    it('should throw error on name not found', async () => {
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const { name, ...payloadTemp } = payload;

      await service.validatePayload(payloadTemp).catch((e) => {
        expect(e.message).toEqual('name is a required field');
      });
    });

    it('should throw error on property_type is not one of enums', async () => {
      /* eslint-disable @typescript-eslint/tslint/config */
      const { property_type, ...payloadRest } = payload;
      payloadRest.property_type = '';
      await service.validatePayload(payloadRest).catch((e) => {
        expect(e.message).toContain(
          'property_type must be one of the following',
        );
      });
    });

    it('should throw error on rules_id is not a array', async () => {
      /* eslint-disable @typescript-eslint/tslint/config */
      const { rules_id, ...payloadRest } = payload;
      payloadRest.rules_id = 1;
      await service.validatePayload(payloadRest).catch((e) => {
        expect(e.message).toContain('rules_id must be a `array`');
      });
    });

    it('should throw error on policies_id is not a array', async () => {
      /* eslint-disable @typescript-eslint/tslint/config */
      const { policies_id, ...payloadRest } = payload;
      payloadRest.policies_id = 1;
      await service.validatePayload(payloadRest).catch((e) => {
        expect(e.message).toContain('policies_id must be a `array`');
      });
    });

    it('should throw error on features_id is not a array', async () => {
      /* eslint-disable @typescript-eslint/tslint/config */
      const { features_id, ...payloadRest } = payload;
      payloadRest.features_id = 1;
      await service.validatePayload(payloadRest).catch((e) => {
        expect(e.message).toContain('features_id must be a `array`');
      });
    });

    it('should throw error on address is not a object', async () => {
      const { address, ...payloadRest } = payload;
      payloadRest.address = [];
      await service.validatePayload(payloadRest).catch((e) => {
        expect(e.message).toContain('address must be a `object` type');
      });
    });

    it('should throw error on address.lat is not number', async () => {
      const { ...payloadRest } = payload;
      payloadRest.address = {
        ...payload.address,
        lat: 'wrong_lat',
      };
      await service.validatePayload(payloadRest).catch((e) => {
        expect(e.message).toContain('address.lat must be a `number` type');
      });
    });

    it('should throw error on address.lng is not number', async () => {
      const { ...payloadRest } = payload;
      payloadRest.address = {
        ...payload.address,
        lng: 'wrong_lng',
      };
      await service.validatePayload(payloadRest).catch((e) => {
        expect(e.message).toContain('address.lng must be a `number` type');
      });
    });

    it('should validate payload successfully', async () => {
      const data = await service.validatePayload(payload);
      expect(data).toEqual(undefined);
    });
  });

  describe('create', () => {
    it('should return created success result', async () => {
      const createAddress = jest
        .spyOn(SiteAddressModel, 'create')
        .mockImplementation(
          () =>
            Promise.resolve({
              ...siteSeed.address,
            }) as any,
        );

      const site = jest.spyOn(SiteModel, 'create').mockImplementation(
        () =>
          Promise.resolve({
            ...siteSeed,
          }) as any,
      );

      const userFind = jest
        .spyOn(userService, 'findOne')
        .mockResolvedValue(
          (Promise.resolve(userFound) as undefined) as UserModel,
        );

      const addressFind = jest
        .spyOn(SiteAddressModel, 'findByPk')
        .mockResolvedValue(
          (Promise.resolve(
            payloadOriginal.address,
          ) as undefined) as SiteAddressModel,
        );

      const siteFeatureFind = jest
        .spyOn(SiteFeatureModel, 'findAll')
        .mockImplementation(() => Promise.resolve(siteSeed.features) as any);

      const siteFeatureDestroy = jest
        .spyOn(SiteFeatureModel, 'destroy')
        .mockImplementation(() => Promise.resolve({}) as any);

      const siteFeature = jest
        .spyOn(SiteFeatureModel, 'create')
        .mockImplementation(
          () =>
            Promise.resolve({
              ...siteSeed.features[0],
            }) as any,
        );

      const siteRuleFind = jest
        .spyOn(SiteRuleModel, 'findAll')
        .mockImplementation(() => Promise.resolve(siteSeed.rules) as any);

      const siteRuleDestroy = jest
        .spyOn(SiteRuleModel, 'destroy')
        .mockImplementation(() => Promise.resolve({}) as any);

      const siteRule = jest.spyOn(SiteRuleModel, 'create').mockImplementation(
        () =>
          Promise.resolve({
            ...siteSeed.rules[0],
          }) as any,
      );

      const sitePolicyFind = jest
        .spyOn(SitePolicyModel, 'findAll')
        .mockImplementation(() => Promise.resolve(siteSeed.policies) as any);

      const sitePolicyDestroy = jest
        .spyOn(SitePolicyModel, 'destroy')
        .mockImplementation(() => Promise.resolve({}) as any);

      const sitePolicy = jest
        .spyOn(SitePolicyModel, 'create')
        .mockImplementation(
          () =>
            Promise.resolve({
              ...siteSeed.policies[0],
            }) as any,
        );

      const siteFind = jest.spyOn(SiteModel, 'findByPk').mockImplementation(
        () =>
          Promise.resolve({
            ...siteSeed,
          }) as any,
      );

      const option = {
        user_id: 1,
        roles: [],
        isAdmin: true,
        isHost: true,
      };
      const result = await service.create(payload, option);

      expect(createAddress).toBeCalled();

      expect(userFind).toBeCalled();

      expect(addressFind).toBeCalled();

      expect(siteFeatureDestroy).toBeCalled();
      expect(siteFeature).toBeCalled();
      expect(siteFeatureFind).toBeCalled();

      expect(siteRuleFind).toBeCalled();
      expect(siteRule).toBeCalled();
      expect(siteRuleDestroy).toBeCalled();

      expect(sitePolicyDestroy).toBeCalled();
      expect(sitePolicy).toBeCalled();
      expect(sitePolicyFind).toBeCalled();

      expect(site).toBeCalled();
      expect(siteFind).toBeCalled();

      expect(result.id).toEqual(1);
      expect(result.name).toEqual(siteSeed.name);
    });

    it('should throw error while creating site', async () => {
      const createdSite = jest
        .spyOn(SiteModel, 'create')
        .mockImplementation(() => Promise.reject({}) as any);
      // delete payload.address;
      await service
        .create(payload, {
          user_id: 1,
          roles: [UserRoles.PROVIDER],
          isAdmin: false,
          isHost: true,
        })
        .catch((e) => {
          expect(createdSite).toBeCalled();
          expect(e).toEqual({});
          expect.assertions(2);
        });
    });
  });

  describe('update', () => {
    it('should return updated success result', async () => {
      /* eslint-disable @typescript-eslint/tslint/config */
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const { site_id, ...updateSitePayload } = payload;

      const taxes = jest
        .spyOn(PlatformTaxModel, 'findAll')
        .mockImplementation(() => Promise.resolve([]) as any);

      const updatedSite = jest
        .spyOn(SiteModel, 'update')
        .mockImplementation(() => Promise.resolve({ ...siteSeed }) as any);

      const site = jest.spyOn(SiteModel, 'findByPk').mockImplementation(
        () =>
          Promise.resolve({
            ...siteSeed,
            user_id: 1,
            save: () => null,
          }) as any,
      );
      const result = await service.update(1, updateSitePayload, {
        user_id: 1,
        roles: [UserRoles.PROVIDER],
        isAdmin: false,
        isHost: true,
      });
      expect(site).toBeCalled();
      expect(result.modified).toEqual(1);
      expect(result.edges[0].id).toEqual(siteSeed.id);
      expect.assertions(3);
    });

    it('should throw error while updating site', async () => {
      /* eslint-disable @typescript-eslint/tslint/config */
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const { site_id, ...updateSitePayload } = payload;
      const updatedSite = jest
        .spyOn(SiteModel, 'update')
        .mockImplementation(() => Promise.reject({}) as any);
      const site = jest.spyOn(SiteModel, 'findByPk').mockImplementation(
        () =>
          Promise.resolve({
            ...siteSeed,
            user_id: 1,
            save: () => null,
          }) as any,
      );
      await service
        .update(1, updateSitePayload, {
          user_id: 1,
          roles: [UserRoles.PROVIDER],
          isAdmin: false,
          isHost: true,
        })
        .catch((e) => {
          expect(updatedSite).toBeCalled();
          expect(site).toBeCalled();
          expect(e).toEqual({});
          expect.assertions(3);
        });
    });
  });
});
