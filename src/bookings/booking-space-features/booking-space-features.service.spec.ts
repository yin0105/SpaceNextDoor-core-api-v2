import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { BookingSpaceFeatureModel } from './booking-space-feature.model';
import { bookingSpaceFeatureProvider } from './booking-space-feature.provider';
import { BookingSpaceFeatureService } from './booking-space-feature.service';

describe('BookingSpaceFeatureService', () => {
  let service: BookingSpaceFeatureService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [],
      providers: [
        ...bookingSpaceFeatureProvider,
        BookingSpaceFeatureService,
        Logger,
      ],
    }).compile();

    service = module.get<BookingSpaceFeatureService>(
      BookingSpaceFeatureService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect.assertions(1);
  });

  describe('upsert', () => {
    it('should throw error while upserting booking space feature', async () => {
      const bookingSpaceFeatures = jest
        .spyOn(BookingSpaceFeatureModel, 'findAll')
        .mockImplementation(() => Promise.reject({}) as any);
      await service.upsert(1, [1]).catch((e) => {
        expect(bookingSpaceFeatures).toBeCalled();
        expect(e).toEqual({});
        expect.assertions(2);
      });
    });
  });
  describe('getByBookingId', () => {
    it('should throw error while finding booking space feature by booking id', async () => {
      const bookingSiteFeatures = jest
        .spyOn(BookingSpaceFeatureModel, 'findAll')
        .mockImplementation(() => Promise.reject({}) as any);
      await service.getByBookingId(1).catch((e) => {
        expect(bookingSiteFeatures).toBeCalled();
        expect(e).toEqual({});
        expect.assertions(2);
      });
    });
  });
});
