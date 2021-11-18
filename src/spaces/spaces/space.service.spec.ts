import { Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';

import { UserRoles } from '../../auth/users/interfaces/user.interface';
import { BookingService } from '../../bookings/booking.service';
import { countryProvider } from '../../countries/country.provider';
import { SpacePayload, SpaceSizeUnit } from '../../graphql.schema';
import { PlatformSpaceTypeService } from '../../platform/space-types/space-type.service';
import { SEQUELIZE_PROVIDER } from '../../shared/constant/app.constant';
import { SiteModel } from '../../sites/sites/site.model';
import { siteProvider } from '../../sites/sites/site.provider';
import { siteSeed } from '../../sites/sites/site.seed';
import { PriceService } from '../prices/price.service';
import { SpaceFeatureService } from '../space-features/space-feature.service';
import { SpaceModel } from './space.model';
import { spaceProvider } from './space.provider';
import { spaceSeed } from './space.seed';
import { SpaceService } from './space.service';

const payloadOriginal: SpacePayload = {
  height: 2.2,
  width: 3.2,
  length: 3.1,
  size_unit: SpaceSizeUnit.sqft,
  price_per_month: 20,
  total_units: 5,
  site_id: 1,
  features_id: [1],
};

describe('SpaceService', () => {
  let service: SpaceService;
  let payload;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        ...spaceProvider,
        ...siteProvider,
        ...countryProvider,
        SpaceService,
        {
          provide: PriceService,
          useValue: { create: jest.fn(), update: jest.fn() },
        },
        {
          provide: SpaceFeatureService,
          useValue: { upsert: jest.fn() },
        },
        {
          provide: BookingService,
          useValue: { upsert: jest.fn() },
        },
        {
          provide: PlatformSpaceTypeService,
          useValue: { getBySize: jest.fn() },
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

    service = module.get<SpaceService>(SpaceService);
    payload = payloadOriginal;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect.assertions(1);
  });

  describe('validateSpacePayload', () => {
    it('should throw error on site_id not found', async () => {
      /* eslint-disable @typescript-eslint/tslint/config */
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const { site_id, ...payloadRest } = payload;

      await service.validateSpacePayload(payloadRest).catch((e) => {
        expect(e.message).toEqual('site_id is a required field');
      });
    });

    it('should throw error on feature_id is not a array', async () => {
      /* eslint-disable @typescript-eslint/tslint/config */
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const { features_id, ...payloadRest } = payload;
      payloadRest.features_id = 1;
      await service.validateSpacePayload(payloadRest).catch((e) => {
        expect(e.message).toContain('features_id must be a `array`');
      });
    });

    it('should throw error on size_unit is not one of enums', async () => {
      /* eslint-disable @typescript-eslint/tslint/config */
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const { size_unit, ...payloadRest } = payload;
      payloadRest.size_unit = '';
      await service.validateSpacePayload(payloadRest).catch((e) => {
        expect(e.message).toContain('size_unit must be one of the following');
      });
    });
  });
  describe('validateUpdateSpacePayload', () => {
    it('should throw error on feature_id is not a array', async () => {
      /* eslint-disable @typescript-eslint/tslint/config */
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const { features_id, site_id, ...payloadRest } = payload;
      payloadRest.features_id = 1;
      await service.validateUpdateSpacePayload(payloadRest).catch((e) => {
        expect(e.message).toContain('features_id must be a `array`');
      });
    });

    it('should throw error on size_unit is not one of enums', async () => {
      /* eslint-disable @typescript-eslint/tslint/config */
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const { size_unit, site_id, ...payloadRest } = payload;
      payloadRest.size_unit = '';
      await service.validateSpacePayload(payloadRest).catch((e) => {
        expect(e.message).toContain('size_unit must be one of the following');
      });
    });
  });

  describe('create', () => {
    it('should return created success result', async () => {
      const site = jest
        .spyOn(SiteModel, 'findByPk')
        .mockImplementation(() => Promise.resolve({ ...siteSeed }) as any);
      const createdSpace = jest
        .spyOn(SpaceModel, 'create')
        .mockImplementation(() => Promise.resolve({ ...spaceSeed }) as any);
      const space = jest
        .spyOn(SpaceModel, 'findOne')
        .mockImplementation(() => Promise.resolve({ ...spaceSeed }) as any);
      const result = await service.create(payload, {
        user_id: 1,
        roles: [UserRoles.PROVIDER],
        isAdmin: false,
        isHost: true,
      });
      expect(site).toBeCalled();
      expect(createdSpace).toBeCalled();
      expect(space).toBeCalled();
      expect(result.id).toEqual(siteSeed.id);
      expect(result.prices[0].price_per_month).toEqual(
        spaceSeed.prices[0].price_per_month,
      );
      expect.assertions(5);
    });

    it('should throw error while creating space', async () => {
      const site = jest
        .spyOn(SiteModel, 'findByPk')
        .mockImplementation(() => Promise.reject({}) as any);
      const createdSpace = jest
        .spyOn(SpaceModel, 'create')
        .mockImplementation(() => Promise.reject({}) as any);
      const space = jest
        .spyOn(SpaceModel, 'findOne')
        .mockImplementation(() => Promise.resolve({ ...spaceSeed }) as any);
      await service
        .create(payload, {
          user_id: 1,
          roles: [UserRoles.PROVIDER],
          isAdmin: false,
          isHost: true,
        })
        .catch((e) => {
          expect(site).toBeCalled();
          expect(createdSpace).toBeCalled();
          expect(space).toBeCalled();
          expect(e).toEqual({});
          expect.assertions(4);
        });
    });
  });

  // describe('update', () => {
  //   it('should return created success result', async () => {
  //     /* eslint-disable @typescript-eslint/tslint/config */
  //     /* eslint-disable @typescript-eslint/no-unused-vars */
  //     const { site_id, ...updateSpacePayload } = payload;
  //     const updatedSpace = jest
  //       .spyOn(SpaceModel, 'update')
  //       .mockImplementation(() => Promise.resolve({ ...spaceSeed }) as any);
  //     const space = jest
  //       .spyOn(SpaceModel, 'findOne')
  //       .mockImplementation(() => Promise.resolve({ ...spaceSeed }) as any);
  //     const result = await service.update(1, updateSpacePayload, {
  //       user_id: 1,
  //       roles: [UserRoles.PROVIDER],
  //       isAdmin: false,
  //       isHost: true,
  //     });
  //     expect(updatedSpace).toBeCalled();
  //     expect(space).toBeCalled();
  //     expect(result.modified).toEqual(1);
  //     expect(result.edges[0].id).toEqual(spaceSeed.id);
  //     expect.assertions(4);
  //   });

  //   it('should throw error while updating space', async () => {
  //     /* eslint-disable @typescript-eslint/tslint/config */
  //     /* eslint-disable @typescript-eslint/no-unused-vars */
  //     const { site_id, ...updateSpacePayload } = payload;
  //     const updatedSpace = jest
  //       .spyOn(SpaceModel, 'update')
  //       .mockImplementation(() => Promise.reject({}) as any);
  //     const space = jest
  //       .spyOn(SpaceModel, 'findOne')
  //       .mockImplementation(() => Promise.resolve({ ...spaceSeed }) as any);
  //     await service
  //       .update(1, updateSpacePayload, {
  //         user_id: 1,
  //         roles: [UserRoles.PROVIDER],
  //         isAdmin: false,
  //         isHost: true,
  //       })
  //       .catch((e) => {
  //         expect(updatedSpace).toBeCalled();
  //         expect(space).toBeCalled();
  //         expect(e).toEqual({});
  //         expect.assertions(3);
  //       });
  //   });
  // });
});
