import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { BookingHistoryModel } from './booking-history.model';
import { bookingHistoryProvider } from './booking-history.provider';
import {
  bookingHistoryPayload,
  bookingHistorySeed,
} from './booking-history.seed';
import { BookingHistoryService } from './booking-history.service';

describe('BookingHistoryService', () => {
  let service: BookingHistoryService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [],
      providers: [...bookingHistoryProvider, BookingHistoryService, Logger],
    }).compile();

    service = module.get<BookingHistoryService>(BookingHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect.assertions(1);
  });

  describe('upsert', () => {
    it('should throw error while upserting booking history', async () => {
      const bookingHistory = jest
        .spyOn(BookingHistoryModel, 'create')
        .mockImplementation(() => Promise.reject({}) as any);
      await service.upsert(bookingHistoryPayload).catch((e) => {
        expect(bookingHistory).toBeCalled();
        expect(e).toEqual({});
        expect.assertions(2);
      });
    });
    it('should create booking history', async () => {
      const bookingHistory = jest
        .spyOn(BookingHistoryModel, 'create')
        .mockImplementation(
          () => Promise.resolve({ ...bookingHistorySeed }) as any,
        );
      const result = await service.upsert(bookingHistoryPayload);
      expect(bookingHistory).toBeCalled();
      expect(result).toBeDefined();
      expect(result.id).toEqual(1);
      expect(result.status).toEqual('RESERVED');
      expect(result.note).toEqual('Your booking has been reserved');
      expect.assertions(5);
    });
  });
  describe('getByBookingId', () => {
    it('should throw error while finding booking history by booking id', async () => {
      const bookingHistory = jest
        .spyOn(BookingHistoryModel, 'findAll')
        .mockImplementation(() => Promise.reject({}) as any);
      await service.getByBookingId(1).catch((e) => {
        expect(bookingHistory).toBeCalled();
        expect(e).toEqual({});
        expect.assertions(2);
      });
    });
  });
});
