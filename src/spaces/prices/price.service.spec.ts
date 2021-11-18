import { Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';

import { PriceType } from '../../graphql.schema';
import { ISpacePriceEntity } from './interfaces/price.interface';
import { PriceModel } from './price.model';
import { priceProvider } from './price.provider';
import { PriceService } from './price.service';

const pricePayload: ISpacePriceEntity = {
  id: 1,
  price_per_day: null,
  price_per_month: 30,
  price_per_week: null,
  price_per_year: null,
  type: PriceType.BASE_PRICE,
  currency_sign: '$',
  currency: 'USD',
  space_id: 1,
  created_at: null,
  updated_at: null,
};

const createPricePayload: Partial<ISpacePriceEntity> = {
  price_per_month: 30,
  space_id: 1,
  currency: 'USD',
  type: PriceType.BASE_PRICE,
  currency_sign: '$',
};
describe('PriceService', () => {
  let service: PriceService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [...priceProvider, PriceService, Logger],
    }).compile();

    service = module.get<PriceService>(PriceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect.assertions(1);
  });

  describe('create', () => {
    it('should create price', async () => {
      const createPrice = jest.spyOn(PriceModel, 'create').mockImplementation(
        () =>
          Promise.resolve({
            pricePayload,
          }) as any,
      );
      const result = await service.create(createPricePayload);
      expect(createPrice).toBeCalled();
      expect(result).toEqual(undefined);
      expect.assertions(2);
    });
    it('should throw error while creating price', async () => {
      const createPrice = (jest.spyOn as any)(
        PriceModel,
        'create',
      ).mockResolvedValue(() => {
        throw new Error('Error');
      });
      expect(createPrice).toBeCalled();
      await service.create(createPricePayload).catch((e) => {
        expect(e).toEqual(() => {
          throw new Error('Error');
        });
        expect.assertions(2);
      });
    });
  });

  describe('update', () => {
    it('should update price', async () => {
      const price = jest.spyOn(PriceModel, 'findOne').mockImplementation(
        () =>
          Promise.resolve({
            pricePayload,
          }) as any,
      );
      const updatedPrice = jest.spyOn(PriceModel, 'update').mockImplementation(
        () =>
          Promise.resolve({
            pricePayload,
          }) as any,
      );
      const result = await service.update(1, 30);
      expect(price).toBeCalled();
      expect(updatedPrice).toBeCalled();
      expect(result).toEqual(undefined);
      expect.assertions(3);
    });
    it('should throw error while updating price', async () => {
      const price = jest.spyOn(PriceModel, 'findOne').mockImplementation(
        () =>
          Promise.resolve({
            pricePayload,
          }) as any,
      );
      const updatePrice = (jest.spyOn as any)(
        PriceModel,
        'update',
      ).mockResolvedValue(() => {
        throw new Error('Error');
      });
      expect(updatePrice).toBeCalled();
      expect(price).toBeCalled();
      await service.update(1, 30).catch((e) => {
        expect(e).toEqual(() => {
          throw new Error('Error');
        });
        expect.assertions(3);
      });
    });
  });
});
