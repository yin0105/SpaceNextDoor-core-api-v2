import { Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';

import { SortBy } from '../../../graphql.schema';
import { SEQUELIZE_PROVIDER } from '../../../shared/constant/app.constant';
import { platformFeatureProvider } from '../feature.provider';
import { PlatformFeatureService } from '../feature.service';
import { PlatformFeatureCategoryModel } from './feature-category.model';
import { featureCategoryProvider } from './feature-category.provider';
import { categorySeed } from './feature-category.seed';
import { PlatformFeatureCategoryService } from './feature-category.service';

describe('PlatformFeatureCategoryService', () => {
  let service: PlatformFeatureCategoryService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        ...featureCategoryProvider,
        ...platformFeatureProvider,
        PlatformFeatureCategoryService,
        PlatformFeatureService,
        PlatformFeatureCategoryService,
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

    service = module.get<PlatformFeatureCategoryService>(
      PlatformFeatureCategoryService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return result', async () => {
      /* eslint-disable @typescript-eslint/tslint/config */
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const findCategories = jest
        .spyOn(PlatformFeatureCategoryModel, 'findAndCountAll')
        .mockImplementation(
          () => Promise.resolve({ rows: [categorySeed], count: 1 }) as any,
        );

      const result = await service.getAll(
        { limit: 10, skip: 0 },
        { name_en: SortBy.asc },
      );
      expect(findCategories).toBeCalled();
      expect(result.edges).toEqual([categorySeed]);
      expect(result.edges[0].id).toEqual(categorySeed.id);
      expect.assertions(3);
    });

    it('should return error', async () => {
      /* eslint-disable @typescript-eslint/tslint/config */
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const findCategories = jest
        .spyOn(PlatformFeatureCategoryModel, 'findAndCountAll')
        .mockImplementation(() => Promise.reject({}) as any);

      try {
        await service.getAll({ limit: 10, skip: 0 }, { name_en: SortBy.asc });
      } catch (e) {
        expect(findCategories).toBeCalled();
        expect(e).toEqual({});
        expect.assertions(2);
      }
    });
  });
});
