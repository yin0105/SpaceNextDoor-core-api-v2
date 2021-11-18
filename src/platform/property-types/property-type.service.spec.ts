import { Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';

import { SortBy } from '../../graphql.schema';
import { SEQUELIZE_PROVIDER } from '../../shared/constant/app.constant';
import { PlatformPropertyTypeModel } from './property-type.model';
import { propertyTypeProvider } from './property-type.provider';
import { propertyTypeSeed } from './property-type.seed';
import { PropertyTypeService } from './property-type.service';

describe('PropertyTypeService', () => {
  let service: PropertyTypeService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        ...propertyTypeProvider,
        PropertyTypeService,
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

    service = module.get<PropertyTypeService>(PropertyTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return result', async () => {
      /* eslint-disable @typescript-eslint/tslint/config */
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const findResult = jest
        .spyOn(PlatformPropertyTypeModel, 'findAndCountAll')
        .mockImplementation(
          () => Promise.resolve({ rows: [propertyTypeSeed], count: 1 }) as any,
        );

      const result = await service.getAll(
        { limit: 10, skip: 0 },
        { name_en: SortBy.asc },
      );
      expect(findResult).toBeCalled();
      expect(result.edges).toEqual([propertyTypeSeed]);
      expect(result.edges[0].id).toEqual(propertyTypeSeed.id);
      expect.assertions(3);
    });

    it('should return error', async () => {
      /* eslint-disable @typescript-eslint/tslint/config */
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const findResult = jest
        .spyOn(PlatformPropertyTypeModel, 'findAndCountAll')
        .mockImplementation(() => Promise.reject({}) as any);

      try {
        await service.getAll({ limit: 10, skip: 0 }, { name_en: SortBy.asc });
      } catch (e) {
        expect(findResult).toBeCalled();
        expect(e).toEqual({});
        expect.assertions(2);
      }
    });
  });
});
