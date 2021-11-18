import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';

import { AppliedTaxService } from '../../applied-taxes/applied-tax.service';
import { InsuranceService } from '../../platform/insurances/insurance.service';
import { Service } from '../../platform/services/service';
import { PromotionModel } from '../../promotions/promotion/promotion.model';
import { PromotionService } from '../../promotions/promotion/promotion.service';
import { QuotationItemModel } from '../../quotations/models/quotation-item.model';
import {
  BOOKING_REPOSITORY,
  PROMOTION_REPOSITORY,
  QUOTATION_ITEM_REPOSITORY,
  SPACE_REPOSITORY,
} from '../../shared/constant/app.constant';
import { SpaceModel } from '../../spaces/spaces/space.model';
import { BookingModel } from '../booking.model';
import { RenewalModel } from './renewal.model';
import { renewalProvider } from './renewal.provider';
import { renewalPayload, renewalSeed } from './renewal.seed';
import { RenewalService } from './renewal.service';

describe('RenewalService', () => {
  let service: RenewalService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [],
      providers: [
        ...renewalProvider,
        RenewalService,
        ConfigService,
        {
          provide: SPACE_REPOSITORY,
          useValue: SpaceModel,
        },
        {
          provide: PROMOTION_REPOSITORY,
          useValue: PromotionModel,
        },
        {
          provide: BOOKING_REPOSITORY,
          useValue: BookingModel,
        },
        {
          provide: QUOTATION_ITEM_REPOSITORY,
          useValue: QuotationItemModel,
        },
        {
          provide: PromotionService,
          useValue: {},
        },
        {
          provide: InsuranceService,
          useValue: {},
        },
        {
          provide: AppliedTaxService,
          useValue: {},
        },
        {
          provide: Service,
          useValue: {},
        },
        Logger,
      ],
    }).compile();

    service = module.get<RenewalService>(RenewalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect.assertions(1);
  });

  describe('create', () => {
    it('should throw error while creating renewal', async () => {
      const renewal = jest
        .spyOn(RenewalModel, 'create')
        .mockImplementation(() => Promise.reject({}) as any);
      await service.create(renewalPayload).catch((e) => {
        expect(renewal).toBeCalled();
        expect(e).toEqual({});
        expect.assertions(2);
      });
    });
    it('should create renewal', async () => {
      const renewal = jest
        .spyOn(RenewalModel, 'create')
        .mockImplementation(() => Promise.resolve({ ...renewalSeed }) as any);
      const result = await service.create(renewalPayload);
      expect(renewal).toBeCalled();
      expect(result).toBeDefined();
      expect(result.id).toEqual(1);
      expect.assertions(3);
    });
  });
});
