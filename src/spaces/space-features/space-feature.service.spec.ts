import { Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';

import { SpaceFeatureModel } from './space-feature.model';
import { spaceFeatureProvider } from './space-feature.provider';
import { SpaceFeatureService } from './space-feature.service';

describe('SpaceFeatureService', () => {
  let service: SpaceFeatureService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [...spaceFeatureProvider, SpaceFeatureService, Logger],
    }).compile();

    service = module.get<SpaceFeatureService>(SpaceFeatureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect.assertions(1);
  });

  describe('upsert', () => {
    it('should throw error while upserting space feature', async () => {
      const spaceFeatures = jest
        .spyOn(SpaceFeatureModel, 'findAll')
        .mockImplementation(() => Promise.reject({}) as any);
      await service.upsert(1, [1]).catch((e) => {
        expect(spaceFeatures).toBeCalled();
        expect(e).toEqual({});
        expect.assertions(2);
      });
    });
  });
});
