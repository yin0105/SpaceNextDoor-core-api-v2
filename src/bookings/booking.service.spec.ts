import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { AppliedTaxService } from '../applied-taxes/applied-tax.service';
import { UserModel } from '../auth/users/user.model';
import { UserService } from '../auth/users/user.service';
import { IDCounterService } from '../ids_counter/ids_counter.service';
import { LogisticsService } from '../logistics/logistics.service';
import { GoGoxLogisticsService } from '../logistics/providers/gogox/gogox.logistics.service';
import { OrderHistoryService } from '../orders/order_history/order-history.service';
import { orderProvider } from '../orders/order.provider';
import { InsuranceService } from '../platform/insurances/insurance.service';
import { Service } from '../platform/services/service';
import { PromotionService } from '../promotions/promotion/promotion.service';
import { PromotionRedeemService } from '../promotions/redeem/redeem.service';
import { QuotationItemModel } from '../quotations/models/quotation-item.model';
import { QuotationModel } from '../quotations/models/quotation.model';
import { RefundService } from '../refunds/refund.service';
import {
  QUOTATION_ITEM_REPOSITORY,
  QUOTATION_REPOSITORY,
  SEQUELIZE_PROVIDER,
  USER_REPOSITORY,
} from '../shared/constant/app.constant';
import { SiteModel } from '../sites/sites/site.model';
import { siteProvider } from '../sites/sites/site.provider';
import { siteSeed } from '../sites/sites/site.seed';
import { SpaceModel } from '../spaces/spaces/space.model';
import { spaceProvider } from '../spaces/spaces/space.provider';
import { StripeService } from '../stripe/stripe.service';
import { BookingHistoryService } from './booking-history/booking-history.service';
import { BookingSiteAddressService } from './booking-site-addresses/booking-site-address.service';
import { BookingSiteFeatureService } from './booking-site-features/booking-site-feature.service';
import { BookingSpaceFeatureService } from './booking-space-features/booking-space-feature.service';
import { bookingProvider } from './booking.provider';
import { bookingPayload } from './booking.seed';
import { BookingService } from './booking.service';
import { BookingPromotionService } from './promotions/promotion/promotion.service';
import { RenewalService } from './renewals/renewal.service';
import { TransactionService } from './transactions/transaction.service';

describe('BookingService', () => {
  let service: BookingService;
  let payload;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [],
      providers: [
        {
          provide: SEQUELIZE_PROVIDER,
          useValue: {
            transaction: jest.fn(() => ({
              commit: jest.fn(),
              rollback: jest.fn(),
            })),
          },
        },
        ...siteProvider,
        ...orderProvider,
        ...spaceProvider,
        ...bookingProvider,
        BookingService,
        {
          provide: InsuranceService,
          useValue: {},
        },
        {
          provide: LogisticsService,
          useValue: {},
        },
        {
          provide: GoGoxLogisticsService,
          useValue: {},
        },
        {
          provide: RefundService,
          useValue: {},
        },
        {
          provide: OrderHistoryService,
          useValue: {},
        },
        {
          provide: IDCounterService,
          useValue: {},
        },
        {
          provide: Service,
          useValue: {},
        },
        {
          provide: USER_REPOSITORY,
          useValue: UserModel,
        },
        {
          provide: USER_REPOSITORY,
          useValue: UserModel,
        },
        {
          provide: QUOTATION_ITEM_REPOSITORY,
          useValue: QuotationItemModel,
        },
        {
          provide: QUOTATION_REPOSITORY,
          useValue: QuotationModel,
        },
        {
          provide: StripeService,
          useValue: {
            createCustomer: jest.fn(),
            updateCustomer: jest.fn(),
            charge: jest.fn(),
          },
        },
        {
          provide: TransactionService,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: RenewalService,
          useValue: { create: jest.fn() },
        },
        {
          provide: UserService,
          useValue: { findOrCreateByEmailPhone: jest.fn() },
        },
        {
          provide: BookingSiteAddressService,
          useValue: { create: jest.fn() },
        },
        {
          provide: BookingSpaceFeatureService,
          useValue: { upsert: jest.fn() },
        },
        {
          provide: BookingSiteFeatureService,
          useValue: { upsert: jest.fn() },
        },
        {
          provide: BookingHistoryService,
          useValue: { upsert: jest.fn() },
        },

        {
          provide: PromotionService,
          useValue: { upsert: jest.fn() },
        },
        {
          provide: BookingPromotionService,
          useValue: { upsert: jest.fn() },
        },
        {
          provide: PromotionRedeemService,
          useValue: { upsert: jest.fn() },
        },
        {
          provide: AppliedTaxService,
          useValue: { upsert: jest.fn() },
        },
        Logger,
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
    payload = bookingPayload;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect.assertions(1);
  });

  describe('validateBookingPayload', () => {
    it('should throw error on site_id not found', async () => {
      /* eslint-disable @typescript-eslint/tslint/config */
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const { site_id, ...payloadRest } = payload;

      await service.validateBookingPayload(payloadRest).catch((e) => {
        expect(e.message).toEqual('site_id is a required field');
      });
    });

    it('should throw error on name not found', async () => {
      /* eslint-disable @typescript-eslint/tslint/config */
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const { name, ...payloadRest } = payload;
      await service.validateBookingPayload(payloadRest).catch((e) => {
        expect(e.message).toEqual('name is a required field');
      });
    });

    it('should throw error on space_id not found', async () => {
      /* eslint-disable @typescript-eslint/tslint/config */
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const { space_id, ...payloadRest } = payload;
      await service.validateBookingPayload(payloadRest).catch((e) => {
        expect(e.message).toEqual('space_id is a required field');
      });
    });
  });

  describe('create', () => {
    it('should throw error that site not found', async () => {
      const site = jest
        .spyOn(SiteModel, 'findByPk')
        .mockImplementation(() => Promise.reject({}) as any);
      await service.create(payload).catch((e) => {
        expect(site).toBeCalled();
        expect(e).toEqual({});
        expect.assertions(2);
      });
    });

    it('should throw error that space not found', async () => {
      const site = jest
        .spyOn(SiteModel, 'findByPk')
        .mockImplementation(() => Promise.resolve({ ...siteSeed }) as any);
      const space = jest
        .spyOn(SpaceModel, 'findOne')
        .mockImplementation(() => Promise.reject({}) as any);
      await service.create(payload).catch((e) => {
        expect(site).toBeCalled();
        expect(space).toBeCalled();
        expect(e).toEqual({});
        expect.assertions(3);
      });
    });
  });
});
