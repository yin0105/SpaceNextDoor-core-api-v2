import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { BookingSiteFeatureModel } from './booking-site-feature.model';
import { bookingSiteFeatureProvider } from './booking-site-feature.provider';
import { BookingSiteFeatureService } from './booking-site-feature.service';

describe('BookingSiteFeatureService', () => {
  let service: BookingSiteFeatureService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [],
      providers: [
        ...bookingSiteFeatureProvider,
        BookingSiteFeatureService,
        Logger,
      ],
    }).compile();

    service = module.get<BookingSiteFeatureService>(BookingSiteFeatureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect.assertions(1);
  });

  describe('upsert', () => {
    it('should throw error while upserting booking site feature', async () => {
      const bookingSiteFeatures = jest
        .spyOn(BookingSiteFeatureModel, 'findAll')
        .mockImplementation(() => Promise.reject({}) as any);
      await service.upsert(1, [1]).catch((e) => {
        expect(bookingSiteFeatures).toBeCalled();
        expect(e).toEqual({});
        expect.assertions(2);
      });
    });
  });
  describe('getByBookingId', () => {
    it('should throw error while finding booking site feature by booking id', async () => {
      const bookingSiteFeatures = jest
        .spyOn(BookingSiteFeatureModel, 'findAll')
        .mockImplementation(() => Promise.reject({}) as any);
      await service.getByBookingId(1).catch((e) => {
        expect(bookingSiteFeatures).toBeCalled();
        expect(e).toEqual({});
        expect.assertions(2);
      });
    });
  });
});
