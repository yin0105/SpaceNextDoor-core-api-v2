import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { BookingSiteAddressModel } from './booking-site-address.model';
import { bookingSiteAddressProvider } from './booking-site-address.provider';
import {
  bookingSiteAddressPayload,
  bookingSiteAddressSeed,
} from './booking-site-address.seed';
import { BookingSiteAddressService } from './booking-site-address.service';

describe('BookingSiteAddressService', () => {
  let service: BookingSiteAddressService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [],
      providers: [
        ...bookingSiteAddressProvider,
        BookingSiteAddressService,
        Logger,
      ],
    }).compile();

    service = module.get<BookingSiteAddressService>(BookingSiteAddressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect.assertions(1);
  });

  describe('create', () => {
    it('should throw error while creating booking site address', async () => {
      const bookingSiteAddress = jest
        .spyOn(BookingSiteAddressModel, 'create')
        .mockImplementation(() => Promise.reject({}) as any);
      await service.create(bookingSiteAddressPayload).catch((e) => {
        expect(bookingSiteAddress).toBeCalled();
        expect(e).toEqual({});
        expect.assertions(2);
      });
    });
    it('should create booking site address', async () => {
      const bookingSiteAddress = jest
        .spyOn(BookingSiteAddressModel, 'create')
        .mockImplementation(
          () => Promise.resolve({ ...bookingSiteAddressSeed }) as any,
        );
      const result = await service.create(bookingSiteAddressPayload);
      expect(bookingSiteAddress).toBeCalled();
      expect(result).toBeDefined();
      expect(result.id).toEqual(1);
      expect(result.lat).toEqual(22.572646);
      expect(result.lng).toEqual(88.363895);
      expect.assertions(5);
    });
  });
  describe('getById', () => {
    it('should throw error while finding booking site address by id', async () => {
      const bookingSiteAddress = jest
        .spyOn(BookingSiteAddressModel, 'findByPk')
        .mockImplementation(() => Promise.reject({}) as any);
      await service.getById(1).catch((e) => {
        expect(bookingSiteAddress).toBeCalled();
        expect(e).toEqual({});
        expect.assertions(2);
      });
    });
    it('should get booking site address by id', async () => {
      const bookingSiteAddress = jest
        .spyOn(BookingSiteAddressModel, 'findByPk')
        .mockImplementation(
          () => Promise.resolve({ ...bookingSiteAddressSeed }) as any,
        );
      const result = await service.getById(1);
      expect(bookingSiteAddress).toBeCalled();
      expect(result).toBeDefined();
      expect(result.id).toEqual(1);
      expect(result.lat).toEqual(22.572646);
      expect(result.lng).toEqual(88.363895);
      expect.assertions(5);
    });
  });
});
