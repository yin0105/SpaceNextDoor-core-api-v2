import { Inject, Injectable, Logger } from '@nestjs/common';
import { isPhoneNumber } from 'class-validator';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import Phone from 'phone';
import { Op, Transaction, WhereOptions } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import Stripe from 'stripe';

import { AppliedTaxModel } from '../applied-taxes/applied-tax.model';
import { AppliedTaxService } from '../applied-taxes/applied-tax.service';
import { ICalculateTexResp } from '../applied-taxes/interfaces/applied-tax.interface';
import { IAuthUser } from '../auth/auth.decorators';
import { UserModel } from '../auth/users/user.model';
import { UserService } from '../auth/users/user.service';
import { CityModel } from '../countries/cities/city.model';
import { CountryModel } from '../countries/country.model';
import { DistrictModel } from '../countries/districts/district.model';
import {
  AddPromotionsToBookingPayload,
  AddPromotionsToBookingResp,
  Booking,
  BookingCancellation,
  BookingFilter,
  BookingPayload,
  BookingPriceChange,
  BookingsFilter,
  BookingsResp,
  BookingStatus,
  CancelBookingPayload,
  CancelBookingResponse,
  ChangeBookingUnitPayload,
  ChangeBookingUnitResp,
  CheckOutPricePayload,
  CheckOutPriceResp,
  LogisticsEstimatedPrice,
  LogisticsPricePayload,
  OrderStatus,
  Pagination,
  PayBookingPayload,
  PayBookingResp,
  PriceChangeStatus,
  PriceType,
  PriceUpdatePayload,
  PriceUpdateResp,
  PromotionFormat,
  QuotationStatus,
  RefundType,
  Renewal,
  RenewalStatus,
  RenewalType,
  ReviewStatus,
  SpaceStatus,
  StockManagementType,
  TaxEntityType,
  TransactionType,
  UpdateBookingFilter,
  UpdateBookingPayload,
  UpdateBookingResp,
} from '../graphql.schema';
import { IDCounterService } from '../ids_counter/ids_counter.service';
import { LogisticsService } from '../logistics/logistics.service';
import { GoGoxLogisticsService } from '../logistics/providers/gogox/gogox.logistics.service';
import { IOrderHistoryEntity } from '../orders/order_history/interfaces/order-history.interface';
import { OrderHistoryService } from '../orders/order_history/order-history.service';
import { OrderModel } from '../orders/order.model';
import { PlatformFeatureModel } from '../platform/features/feature.model';
import { PlatformInsuranceModel } from '../platform/insurances/insurance.model';
import { InsuranceService } from '../platform/insurances/insurance.service';
import { Service } from '../platform/services/service';
import { PlatformSpaceTypeModel } from '../platform/space-types/space-type.model';
import { IPromotionAmount } from '../promotions/promotion/interfaces/promotion.interface';
import { PromotionService } from '../promotions/promotion/promotion.service';
import { ICreateRedeemPayload } from '../promotions/redeem/interfaces/redeem.interface';
import { PromotionRedeemService } from '../promotions/redeem/redeem.service';
import { QuotationItemModel } from '../quotations/models/quotation-item.model';
import { QuotationModel } from '../quotations/models/quotation.model';
import { IUnusedDaysOption } from '../refunds/interfaces/refund.interface';
import { RefundModel } from '../refunds/refund.model';
import { RefundService } from '../refunds/refund.service';
import {
  BOOKING_REPOSITORY,
  ORDER_REPOSITORY,
  QUOTATION_ITEM_REPOSITORY,
  QUOTATION_REPOSITORY,
  SEQUELIZE_PROVIDER,
  SITE_REPOSITORY,
  SPACE_REPOSITORY,
} from '../shared/constant/app.constant';
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
  PayloadError,
} from '../shared/errors.messages';
import { ErrorNames, getMessageT } from '../shared/lang.messages';
import {
  getEmailTemplateT,
  TemplateNames,
} from '../shared/mailer/email-templates';
import { NotificationService } from '../shared/notifications/notification.service';
import { hasMoreRec, initPagination } from '../shared/utils';
import { getClientBaseUrl } from '../shared/utils/country-config';
import { toSequelizeComparator } from '../shared/utils/graphql-to-sequelize-comparator';
import { SiteAddressModel } from '../sites/site-addresses/site-address.model';
import { SiteFeatureModel } from '../sites/site-features/site-feature.model';
import { SiteModel } from '../sites/sites/site.model';
import { PriceModel } from '../spaces/prices/price.model';
import { SpaceFeatureModel } from '../spaces/space-features/space-feature.model';
import { SpaceModel } from '../spaces/spaces/space.model';
import { StripeService } from '../stripe/stripe.service';
import { TerminationModel } from '../terminations/termination.model';
import { BookingCancellationReasonsModel } from './booking-cancellation-reasons/booking-cancellation-reasons.model';
import { BookingHistoryService } from './booking-history/booking-history.service';
import { BookingHistoryCreate } from './booking-history/booking-history.types';
import { BookingSiteAddressModel } from './booking-site-addresses/booking-site-address.model';
import { BookingSiteAddressService } from './booking-site-addresses/booking-site-address.service';
import { IBookingSiteAddressEntity } from './booking-site-addresses/interfaces/booking-site-address.interface';
import { BookingSiteFeatureService } from './booking-site-features/booking-site-feature.service';
import { BookingSpaceFeatureService } from './booking-space-features/booking-space-feature.service';
import { BookingModel } from './booking.model';
import { BookingCreate } from './booking.types';
import { IBookingArgs, IBookingsFilter } from './interfaces/booking.interface';
import { BookingPromotionModel } from './promotions/promotion/promotion.model';
import { BookingPromotionService } from './promotions/promotion/promotion.service';
import { IRenewalEntity } from './renewals/interfaces/renewal.interface';
import { RenewalModel } from './renewals/renewal.model';
import { RenewalService } from './renewals/renewal.service';
import { ITransactionEntity } from './transactions/interfaces/transaction.interface';
import { TransactionModel } from './transactions/transaction.model';
import { TransactionService } from './transactions/transaction.service';
import calculateCheckOutPriceValidator from './validation/calculate-checkout-price.validation';
import createBookingValidator from './validation/create-booking.validation';

dayjs.extend(utc);

@Injectable()
export class BookingService {
  private notificationService: NotificationService;
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderEntity: typeof OrderModel,
    @Inject(SEQUELIZE_PROVIDER)
    private readonly sequelize: Sequelize,
    @Inject(SITE_REPOSITORY)
    private readonly siteEntity: typeof SiteModel,
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingEntity: typeof BookingModel,
    @Inject(SPACE_REPOSITORY)
    private readonly spaceEntity: typeof SpaceModel,
    @Inject(QUOTATION_ITEM_REPOSITORY)
    private readonly quotationItemEntity: typeof QuotationItemModel,
    @Inject(QUOTATION_REPOSITORY)
    private readonly quotationEntity: typeof QuotationModel,
    private readonly userService: UserService,
    private readonly bookingSiteAddressService: BookingSiteAddressService,
    private readonly bookingSpaceFeatureService: BookingSpaceFeatureService,
    private readonly bookingSiteFeatureService: BookingSiteFeatureService,
    private readonly bookingHistoryService: BookingHistoryService,
    private readonly refundService: RefundService,
    private readonly renewalService: RenewalService,
    private readonly stripeService: StripeService,
    private readonly transactionService: TransactionService,
    private readonly promotionService: PromotionService,
    private readonly bookingPromotionService: BookingPromotionService,
    private readonly promotionRedeemService: PromotionRedeemService,
    private readonly insuranceService: InsuranceService,
    private readonly idCounterService: IDCounterService,
    private readonly orderHistoryService: OrderHistoryService,
    private readonly logisticsService: LogisticsService,
    private readonly goGoXService: GoGoxLogisticsService,
    private readonly appliedTaxService: AppliedTaxService,
    private readonly service: Service,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(BookingService.name);
    this.notificationService = new NotificationService();
  }

  public getSequelizeInstance(): Sequelize {
    return this.sequelize;
  }

  public async validateCheckOutPricePayload(
    payload: CheckOutPricePayload,
    arg?: { language: string },
  ): Promise<void> {
    try {
      const lang = arg?.language;
      await calculateCheckOutPriceValidator.validate(payload);
      const moveInDate = new Date(payload?.move_in_date);
      const moveOutDate = new Date(payload?.move_out_date) || null;

      if (moveInDate < new Date()) {
        throw BadRequestError(
          getMessageT(ErrorNames.INVALID_MOVE_IN_DATE, lang),
        );
      }

      if (
        moveOutDate &&
        (moveOutDate < new Date() || moveOutDate < moveInDate)
      ) {
        throw BadRequestError(
          getMessageT(ErrorNames.INVALID_MOVE_OUT_DATE, lang),
        );
      }
    } catch (e) {
      throw PayloadError(e.message);
    }
  }

  getTotalDays(startDate: Date, endDate: Date): number {
    if (!endDate) {
      return null;
    }

    const date1 = dayjs(startDate);
    const date2 = dayjs(endDate);

    return date2.diff(date1, 'day') + 1;
  }

  public async calculateCheckOutPrice(
    payload: CheckOutPricePayload,
    arg?: { language: string },
  ): Promise<CheckOutPriceResp> {
    const language = arg?.language;
    const checkoutPrice = new CheckOutPriceResp();
    checkoutPrice.total_tax = 0;

    const space = await this.spaceEntity.findByPk(payload?.space_id, {
      include: [{ model: PriceModel }, { model: SiteModel }],
    });

    if (!space) {
      throw BadRequestError(getMessageT(ErrorNames.SPACE_NOT_FOUND, language));
    }

    if (space.site?.stock_management_type === StockManagementType.AFFILIATE) {
      throw BadRequestError(getMessageT(ErrorNames.AFFILIATE_SPACE, language));
    }

    let spacePricePerMonth = space?.prices?.[0]?.price_per_month || 0;

    if (payload?.quotation_item_id) {
      const quotationItem = await this.quotationItemEntity.findOne({
        where: {
          id: payload.quotation_item_id,
        },
        include: [
          {
            model: QuotationModel,
            where: {
              status: QuotationStatus.ACTIVE,
            },
          },
        ],
      });

      if (quotationItem) {
        spacePricePerMonth = quotationItem.price_per_month;
      }
    }

    checkoutPrice.currency_sign = space?.prices?.[0]?.currency_sign;
    checkoutPrice.insurance_price = 0;

    if (payload?.insurance_id) {
      const insurance = await this.insuranceService.getById(
        payload?.insurance_id,
      );
      checkoutPrice.insurance_price = insurance?.price_per_day * 30 || 0;
    }

    const [promo, logistics] = await Promise.all([
      this.calculatePromotion(payload, space, spacePricePerMonth, { language }),
      this.calculateLogistics({
        service_id: payload?.pick_up_service_id,
        pick_up: payload.pickup_service_details?.pick_up_location,
        space_id: payload.space_id,
        schedule_at: payload.pickup_service_details?.schedule_at,
        additional_requirements:
          payload.pickup_service_details?.additional_requirements,
      }),
    ]);

    checkoutPrice.public_promotion = promo.public_promotion;
    checkoutPrice.applied_promotion = promo.applied_promotion;
    checkoutPrice.discounted_amount = promo.discounted_amount;
    checkoutPrice.promotion_error = promo.promotion_error;

    checkoutPrice.service_price = logistics?.amount || 0;

    // if no move out date then it will return null
    const totalDays = this.getTotalDays(
      payload?.move_in_date,
      payload?.move_out_date,
    );

    if (totalDays && totalDays <= 30) {
      const subTotalAmount = (spacePricePerMonth / 30) * totalDays;
      checkoutPrice.sub_total_amount = parseFloat(subTotalAmount.toFixed(2));
      checkoutPrice.deposit_amount = parseFloat(subTotalAmount.toFixed(2));
    } else {
      checkoutPrice.sub_total_amount = spacePricePerMonth;
      checkoutPrice.deposit_amount = spacePricePerMonth;
    }

    // calculate tax
    const taxes = await this.appliedTaxService.calculateTax({
      site_id: space.site_id,
      insurance_id: payload?.insurance_id,
      pickup_service_id: payload.pick_up_service_id,
      space_price:
        promo.discounted_amount > 0
          ? checkoutPrice.sub_total_amount - promo.discounted_amount
          : checkoutPrice.sub_total_amount,
      insurance_price: checkoutPrice.insurance_price,
      pickup_service_price: checkoutPrice.service_price,
    });
    checkoutPrice.total_tax = taxes.totalTax;
    checkoutPrice.applied_taxes = taxes.taxes;

    checkoutPrice.payable_amount =
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      checkoutPrice.sub_total_amount +
      checkoutPrice.insurance_price +
      checkoutPrice.deposit_amount +
      checkoutPrice.service_price +
      taxes.totalTax -
      checkoutPrice.discounted_amount;

    checkoutPrice.payable_amount = parseFloat(
      checkoutPrice.payable_amount.toFixed(2),
    );
    return checkoutPrice;
  }

  private async calculateLogistics(
    payload: LogisticsPricePayload,
  ): Promise<LogisticsEstimatedPrice> {
    // TODO: use pickupServiceId to check the provider and use that to select logistics service

    if (!payload?.service_id || !payload.pick_up) {
      return null;
    }

    const price = await this.logisticsService.getPrice(
      this.goGoXService,
      payload,
    );

    return price.estimated_price;
  }

  private async calculatePromotion(
    payload: CheckOutPricePayload,
    space: SpaceModel,
    spacePrice: number,
    arg?: { language: string },
  ): Promise<CheckOutPriceResp> {
    const language = arg?.language;
    const checkoutPrice = new CheckOutPriceResp();
    const spacePricePerMonth = spacePrice || 0;
    const isPromoApplied = payload?.promo_code || payload?.promotion_id;
    let promotionInfo: IPromotionAmount = null;

    checkoutPrice.discounted_amount = 0;

    if (isPromoApplied) {
      promotionInfo = await this.promotionService.getPromotionAmount(
        space.site_id,
        spacePricePerMonth,
        payload?.move_in_date,
        payload?.move_out_date,
        payload?.promo_code,
        payload?.promotion_id,
      );

      if (promotionInfo?.promotion || promotionInfo?.public_promotion) {
        checkoutPrice.applied_promotion = promotionInfo.promotion;
        checkoutPrice.public_promotion = promotionInfo.public_promotion;
        checkoutPrice.discounted_amount = promotionInfo.discounted_amount;
      } else if (payload.promo_code) {
        checkoutPrice.promotion_error = getMessageT(
          ErrorNames.PROMO_CODE_INVALID,
          language,
        );
      }
    }

    return checkoutPrice;
  }

  public async validateBookingPayload(payload: BookingPayload): Promise<void> {
    try {
      await createBookingValidator.validate(payload);
      const isValidPhoneNumber = isPhoneNumber(payload?.phone_number, 'ZZ');
      if (!isValidPhoneNumber) {
        throw BadRequestError('Please provide valid phone number!');
      }

      const moveInDate = new Date(payload?.move_in_date);
      const moveOutDate = new Date(payload?.move_out_date) || null;
      if (moveInDate < new Date()) {
        throw BadRequestError('Please provide correct move in date');
      }

      if (dayjs(moveInDate).isAfter(dayjs().add(1, 'month'))) {
        throw BadRequestError('Move in date cannot be greater than 1 month!');
      }

      if (
        moveOutDate &&
        (moveOutDate < new Date() || moveOutDate < moveInDate)
      ) {
        throw BadRequestError('Please provide correct move out date');
      }
    } catch (e) {
      throw PayloadError(e.message);
    }
  }

  public getRenewalInfo(booking: BookingModel): any {
    const moveOutDate = booking?.move_out_date || null;
    const renewalsLength = booking?.renewals.length;
    const renewalType = moveOutDate
      ? RenewalType.PARTIAL_SUBSCRIPTION
      : RenewalType.FULL_SUBSCRIPTION;
    // next renewal date of the most recent renewal
    const nextRenewalDateOfLastRenewal = booking?.renewals?.[renewalsLength - 1]
      .next_renewal_date
      ? dayjs(booking?.renewals?.[renewalsLength - 1].next_renewal_date)
      : null;
    // renewal end date of the most recent renewal becomes the renewal start date of the new renewal
    const renewalStartDate = new Date(
      booking?.renewals?.[renewalsLength - 1].renewal_end_date,
    );

    return {
      renewalType,
      renewalStartDate,
      nextRenewalDateOfLastRenewal,
    };
  }

  public async getAllBookings(where: IBookingsFilter): Promise<BookingModel[]> {
    const whereFilter: WhereOptions = toSequelizeComparator({
      status: where?.status,
      created_at: where?.created_at,
    });

    return await this.bookingEntity.findAll({
      where: whereFilter,
      include: [
        { model: RenewalModel },
        { model: PlatformInsuranceModel },
        { model: UserModel, as: 'customer' },
        {
          model: BookingSiteAddressModel,
          include: [{ model: CountryModel }],
        },
      ],
      order: [
        ['id', 'ASC'],
        [{ model: RenewalModel, as: 'renewals' }, 'id', 'ASC'],
      ],
    });
  }

  public async getActiveBookingsToTerminate(
    moveOutDate: Date,
  ): Promise<BookingModel[]> {
    return await this.bookingEntity.findAll({
      where: {
        status: { [Op.eq]: BookingStatus.ACTIVE },
        move_out_date: { [Op.lte]: moveOutDate },
        is_termination_requested: { [Op.ne]: true },
      },
    });
  }

  public async getUnUpdatedRefundBookings(): Promise<BookingModel[]> {
    return await this.bookingEntity.findAll({
      where: {
        is_deposit_refunded: false,
      },
      include: [
        {
          model: RefundModel,
          required: true,
          where: {
            type: { [Op.eq]: RefundType.REFUND_DEPOSIT },
          },
        },
      ],
    });
  }

  public async requestReviewToActiveBookings(
    bookingIds: number[],
  ): Promise<BookingModel[]> {
    return await this.bookingEntity.findAll({
      where: {
        id: { [Op.in]: bookingIds },
      },
      include: [{ model: UserModel, as: 'customer' }, { model: SiteModel }],
    });
  }

  public async getTerminatedBookingsForRefund(
    dateBeforeNDays: Date,
  ): Promise<BookingModel[]> {
    return await this.bookingEntity.findAll({
      where: {
        is_deposit_refunded: false,
        status: BookingStatus.COMPLETED,
      },
      include: [
        {
          model: TerminationModel,
          required: true,
          where: {
            termination_date: { [Op.lte]: dateBeforeNDays },
          },
          include: [
            {
              model: RenewalModel,
              include: [
                {
                  model: TransactionModel,
                },
              ],
            },
          ],
        },
        { model: TransactionModel },
        { model: RenewalModel },
        { model: UserModel, as: 'customer' },
      ],
      order: [
        [{ model: TransactionModel, as: 'transactions' }, 'id', 'ASC'],
        [{ model: RenewalModel, as: 'renewals' }, 'id', 'ASC'],
      ],
    });
  }

  public async getById(
    where: BookingFilter,
    options?: IBookingArgs,
  ): Promise<Booking> {
    const bookingFilter = {
      id: where?.id?._eq,
      customer_id: null,
      provider_id: null,
    };
    if (options?.isAdmin && options?.role === 'ADMIN') {
      delete bookingFilter.customer_id;
      delete bookingFilter.provider_id;
    }
    if (options?.isHost && options?.role === 'PROVIDER') {
      bookingFilter.provider_id = options?.user_id;
      delete bookingFilter.customer_id;
    }
    if (options?.isCustomer && options?.role === 'CUSTOMER') {
      bookingFilter.customer_id = options?.user_id;
      delete bookingFilter.provider_id;
    }
    if (!options) {
      delete bookingFilter.customer_id;
      delete bookingFilter.provider_id;
    }
    return this.bookingEntity.findOne({
      where: bookingFilter,
      include: [
        { model: BookingSiteAddressModel },
        { model: UserModel, as: 'customer' },
        { model: SiteModel },
        { model: SpaceModel, include: [PlatformSpaceTypeModel] },
        { model: QuotationItemModel, include: [QuotationModel] },
      ],
    }) as undefined;
  }

  /**
   * Find/Search for Bookings with filters on:
   * Bookings:
   *  - status
   *  - base_amount
   *  - move_in_date
   *  - move_out_date
   */
  public async findAll(
    pagination: Pagination,
    where?: BookingsFilter & { space_id?: { _eq?: number } },
    options?: IBookingArgs,
  ): Promise<BookingsResp> {
    this.logger.log(`findAll with payload where: ${JSON.stringify(where)}`);
    pagination = initPagination(pagination);
    const whereFilter = toSequelizeComparator(where);

    if (options?.isHost && options?.role === 'PROVIDER') {
      (whereFilter as any).provider_id = options?.user_id;
    }

    if (options?.isCustomer && options?.role === 'CUSTOMER') {
      (whereFilter as any).customer_id = options?.user_id;
    }

    const filter = {
      where: whereFilter,
      limit: pagination.limit,
      offset: pagination.skip,
    };
    const { count, rows } = await this.bookingEntity.findAndCountAll(filter);
    const result = new BookingsResp();
    const edges = (rows as undefined) as Booking[];

    result.edges = edges;
    result.page_info = {
      ...pagination,
      total: count,
      has_more: hasMoreRec(count, pagination),
    };

    return result;
  }

  public async updateBookingPrice(
    payload: PriceUpdatePayload,
    userId: number,
  ): Promise<PriceUpdateResp> {
    // check duplicate item;
    const bookingIds = payload.data.map((priceItem) => priceItem.booking_id);
    if ([...new Set(bookingIds)].length !== payload.data.length) {
      throw BadRequestError('Some of bookings ID are duplicated, please check');
    }
    // find one invalid price item
    const invalidPriceItem = payload.data.find(
      (priceItem) => priceItem.price < 1,
    );
    if (invalidPriceItem) {
      throw BadRequestError(
        `Booking ${invalidPriceItem.booking_id}, price must be positive number, and must be a real price`,
      );
    }

    const whereFilter: WhereOptions = toSequelizeComparator({
      status: {
        _in: [BookingStatus.ACTIVE, BookingStatus.CONFIRMED],
      },
      short_id: {
        _in: bookingIds,
      },
    });

    const bookings = await this.bookingEntity.findAll({
      where: whereFilter,
      include: [
        {
          model: SpaceModel,
          include: [{ model: PriceModel }],
        },
      ],
    });

    if (!bookings?.length) {
      throw NotFoundError('No active booking found with provided IDs');
    }

    const result: BookingPriceChange[] = [];

    const foundIds = bookings.map((booking) => booking.short_id);
    // find not found booking
    const notFoundBooking = bookingIds.filter(
      (shortId) => !foundIds.includes(shortId),
    );

    notFoundBooking.forEach((shortId) => {
      result.push({
        id: null,
        booking_id: shortId,
        fromPrice: null,
        toPrice: null,
        status: PriceChangeStatus.BOOKING_NOT_FOUND,
      });
    });
    let modified = 0;
    for (const booking of bookings) {
      const newPricePerMonthToUpdate = payload.data.find(
        (priceItem) => priceItem.booking_id === booking?.short_id,
      )?.price;
      if (!newPricePerMonthToUpdate) {
        result.push({
          id: booking.id,
          booking_id: booking.short_id,
          fromPrice: null,
          toPrice: null,
          status: PriceChangeStatus.INVALID_PRICE,
        });
        continue;
      }
      const oldBaseAmount = booking?.base_amount;
      const priceDiff = newPricePerMonthToUpdate - oldBaseAmount;
      // skip if there is no price change
      if (Math.abs(priceDiff) < 1) {
        result.push({
          id: booking.id,
          booking_id: booking.short_id,
          fromPrice: null,
          toPrice: null,
          status: PriceChangeStatus.NO_PRICE_CHANGE,
        });
        continue;
      }
      booking.base_amount = parseFloat(newPricePerMonthToUpdate.toFixed(2));

      const bookingHistoryPayload: BookingHistoryCreate = {
        status: booking.status,
        booking_id: booking?.id,
        note: `Price changed from ${oldBaseAmount} to ${booking.base_amount}`,
        old_base_amount: oldBaseAmount,
        base_amount: booking.base_amount,
        changed_by: userId,
      };

      // Process price change if not in preview mode
      if (!payload.review_mode) {
        const t = await this.sequelize.transaction();
        try {
          await Promise.all([
            booking.save({ transaction: t }),
            this.bookingHistoryService.upsert(bookingHistoryPayload, { t }),
          ]);
          await t.commit();
          modified += 1;
        } catch (error) {
          this.logger.error(
            'Error during update price for listed bookings',
            error?.stack,
          );
          await t.rollback();
          result.push({
            id: booking.id,
            booking_id: booking.short_id,
            fromPrice: null,
            toPrice: null,
            status: PriceChangeStatus.NO_PRICE_CHANGE,
          });
          continue;
        }
      }

      result.push({
        id: booking.id,
        booking_id: booking.short_id,
        fromPrice: oldBaseAmount,
        toPrice: booking.base_amount,
        status: PriceChangeStatus.PRICE_CHANGED,
      });
    }

    return {
      edges: result,
      modified,
    };
  }

  getDepositAndSubTotalAmount(
    price: number,
    moveInDate: Date,
    moveOutDate?: Date,
  ): { subTotalAmount: number; depositAmount: number } {
    let depositedAmount = 0;
    let subTotalAmount = 0;
    if (!moveOutDate) {
      // if there is no move out date set then the deposit amount will be for 2 months in advance
      depositedAmount = price;
      subTotalAmount = price;
    }

    if (moveOutDate) {
      const date1 = dayjs(moveInDate);
      const date2 = dayjs(moveOutDate);
      // calculate days between move in date and move out date
      const differenceInDays = date2.diff(date1, 'day') + 1;
      // if days between move in date and move out date is less then 30 then calculate deposited amount based on only those days
      if (differenceInDays <= 30) {
        depositedAmount = (price / 30) * differenceInDays;
        subTotalAmount = (price / 30) * differenceInDays;
      }

      if (differenceInDays > 30) {
        depositedAmount = price;
        subTotalAmount = price;
      }
    }

    return {
      subTotalAmount: parseFloat(subTotalAmount.toFixed(2)),
      depositAmount: parseFloat(depositedAmount.toFixed(2)),
    };
  }

  // eslint-disable-next-line complexity
  public async create(payload: BookingPayload): Promise<Booking> {
    this.logger.setContext(BookingService.name);
    this.logger.log(`create booking with payload: ${JSON.stringify(payload)}`);

    // validate phone and remove 0 in start if provided
    payload.phone_number =
      Phone(payload.phone_number)?.[0] || payload.phone_number;

    const site = await this.siteEntity.findByPk(payload?.site_id, {
      include: [
        { model: SiteAddressModel },
        { model: SiteFeatureModel, include: [{ model: PlatformFeatureModel }] },
      ],
    });

    if (!site) {
      throw NotFoundError('Site not found!');
    }

    if (site.stock_management_type === StockManagementType.AFFILIATE) {
      throw BadRequestError('This site is AFFILIATE, cannot book!');
    }

    const space = await this.spaceEntity.findOne({
      where: {
        [Op.and]: [
          {
            id: payload?.space_id,
          },
          {
            site_id: payload?.site_id,
          },
        ],
      },
      include: [
        {
          model: SpaceFeatureModel,
          include: [{ model: PlatformFeatureModel }],
        },
        {
          model: PriceModel,
          where: { type: PriceType.BASE_PRICE },
        },
      ],
    });

    if (!space) {
      throw NotFoundError('Space not found!');
    }

    const spaceFeatureIds = space?.features?.map(
      (spaceFeature) => spaceFeature?.feature_id,
    );
    const siteFeatureIds = site?.features?.map(
      (siteFeature) => siteFeature?.feature_id,
    );

    const bookingSiteAddressPayload: Omit<
      IBookingSiteAddressEntity,
      'id' | 'created_at' | 'updated_at'
    > = {
      lat: site?.address?.lat,
      lng: site?.address?.lng,
      country_id: site?.address?.country_id,
      city_id: site?.address?.city_id,
      district_id: site?.address?.district_id,
      street: site?.address?.street,
      flat: site?.address?.flat || null,
      postal_code: site?.address?.postal_code,
    };
    const t = await this.sequelize.transaction();

    try {
      const bookingShortId = await this.idCounterService.generateBookingId();

      const [user, bookingSiteAddress] = await Promise.all([
        this.userService.findOrCreateByEmailPhone(
          payload?.email,
          payload?.phone_number,
          {
            t,
            name: payload.name,
            preferred_language: payload.preferred_language,
          },
        ),
        this.bookingSiteAddressService.create(bookingSiteAddressPayload, { t }),
      ]);

      const originalSpacePrice = space?.prices?.[0]?.price_per_month || 0;
      let pricePerMonth = space?.prices[0]?.price_per_month;

      if (payload?.quotation_item_id) {
        const quotationItem = await this.quotationItemEntity.findOne({
          where: {
            id: payload.quotation_item_id,
          },
          include: [
            {
              model: QuotationModel,
              where: {
                status: QuotationStatus.ACTIVE,
              },
            },
          ],
        });
        if (quotationItem) {
          pricePerMonth = quotationItem.price_per_month;
        }
      }

      const promotionInfo = await this.promotionService.getPromotionAmount(
        payload?.site_id,
        pricePerMonth,
        payload?.move_in_date,
        payload?.move_out_date,
        payload?.promo_code,
        payload?.promotion_id,
      );

      const {
        subTotalAmount,
        depositAmount,
      } = this.getDepositAndSubTotalAmount(
        pricePerMonth,
        payload?.move_in_date,
        payload?.move_out_date,
      );

      // calculate tax
      const taxes = await this.appliedTaxService.calculateTax({
        site_id: space.site_id,
        space_price:
          promotionInfo.discounted_amount > 0
            ? subTotalAmount - promotionInfo.discounted_amount
            : subTotalAmount,
      });

      const bookingPayload: BookingCreate = {
        customer_name: payload?.name,
        customer_email: payload?.email,
        short_id: bookingShortId,
        customer_phone_number: payload?.phone_number,
        auto_renewal: payload?.move_out_date ? false : payload?.auto_renewal,
        move_in_date: payload?.move_in_date,
        move_out_date: payload?.move_out_date || null,
        commitment_months: promotionInfo?.min_commitment_months || null,
        is_reviewed: false,
        site_name: site?.name,
        site_description: site?.description,
        site_address_id: bookingSiteAddress?.id,
        site_id: payload?.site_id,
        space_id: payload?.space_id,
        space_size: space?.size,
        space_height: space?.height,
        space_length: space?.length,
        space_width: space?.width,
        space_size_unit: space?.size_unit,
        space_price_per_month: pricePerMonth,
        currency: space?.prices[0]?.currency,
        currency_sign: space?.prices[0]?.currency_sign,
        customer_id: user?.id,
        quotation_item_id: payload?.quotation_item_id || null,
        deposited_amount: depositAmount,
        provider_id: space?.user_id,
        base_amount: pricePerMonth,
        original_base_amount: originalSpacePrice, // only set at create booking time
        sub_total_amount: subTotalAmount,
        total_tax_amount: taxes.totalTax,
        total_amount: parseFloat(
          (
            subTotalAmount +
            taxes.totalTax +
            depositAmount -
            promotionInfo.discounted_amount
          ).toFixed(2),
        ),
        discount_amount: promotionInfo.discounted_amount,
      };

      const booking = await this.bookingEntity.create(bookingPayload, {
        transaction: t,
      });

      const bookingHistoryPayload: BookingHistoryCreate = {
        status: BookingStatus.RESERVED,
        booking_id: booking?.id,
        note: 'Your booking has been reserved',
        changed_by: user?.id,
      };

      const renewalPayload = this.renewalService.getRenewalPayload(
        0,
        depositAmount,
        payload?.move_in_date,
        null,
        booking?.id,
        pricePerMonth,
        promotionInfo.discounted_amount,
        RenewalStatus.UN_PAID,
        RenewalType.BOOKING,
        null,
        payload?.move_out_date,
      );

      let bookingPromoId = null;
      let bookingPublicPromoId = null;
      if (promotionInfo.promotion) {
        bookingPromoId = (
          await this.bookingPromotionService.create(
            promotionInfo.promotion.id,
            {
              t,
              booking_id: booking.id,
              applied_at: renewalPayload.renewal_start_date,
            },
          )
        ).id;
      }

      // for public promotion which will apply on next renewals
      if (promotionInfo.public_promotion) {
        bookingPublicPromoId = (
          await this.bookingPromotionService.create(
            promotionInfo.public_promotion?.id,
            {
              t,
              booking_id: booking.id,
              applied_at: renewalPayload.renewal_start_date,
            },
          )
        ).id;
      }

      const renewal = await this.renewalService.create(
        {
          ...renewalPayload,
          booking_promotion_id: bookingPromoId,
          promotion_id: promotionInfo?.promotion?.id,
          renewal_paid_date: null,
          total_tax_amount: taxes.totalTax,
          total_amount: parseFloat(
            (renewalPayload.total_amount + taxes.totalTax).toFixed(2),
          ),
        },
        { t },
      );

      await this.appliedTaxService.createAppliedTaxes(taxes.taxes, booking.id, {
        t,
        userId: user?.id,
        renewalId: renewal?.id,
      });

      const promises = [
        this.bookingSiteFeatureService.upsert(booking?.id, siteFeatureIds, {
          t,
        }),
        this.bookingSpaceFeatureService.upsert(booking?.id, spaceFeatureIds, {
          t,
        }),
        this.bookingHistoryService.upsert(bookingHistoryPayload, { t }),
      ];

      // if promotion was applied, then create booking promotion entries and redeem entry
      if (promotionInfo.promotion) {
        promises.concat(
          await this.bookingPromotionService.createBuysGets(
            promotionInfo.promotion.id,
            {
              t,
              promotion_id: bookingPromoId,
            },
          ),
        );
      }

      if (promotionInfo.public_promotion) {
        promises.concat(
          await this.bookingPromotionService.createBuysGets(
            promotionInfo.public_promotion.id,
            {
              t,
              promotion_id: bookingPublicPromoId,
            },
          ),
        );
      }

      await Promise.all(promises);
      await t.commit();

      // update projected amount for next month
      if (renewalPayload.next_renewal_sub_total) {
        await this.updateRenewalProjectedAmount(
          booking,
          renewalPayload.next_renewal_sub_total,
          renewal?.id,
        );
      }

      return (booking as undefined) as Booking;
    } catch (e) {
      this.logger.error('Create Booking Error: ', e?.stack);

      // rollback the transaction.
      await t.rollback();

      throw new Error(e.message);
    }
  }

  // eslint-disable-next-line complexity
  public async payBooking(
    payload: PayBookingPayload,
    userId: number,
  ): Promise<PayBookingResp> {
    this.logger.setContext(BookingService.name);
    this.logger.log(`pay with payload: ${JSON.stringify(payload)}`);

    const booking = await this.bookingEntity.findByPk(payload?.booking_id, {
      include: [
        { model: RenewalModel },
        { model: OrderModel },
        { model: UserModel, as: 'provider' },
        { model: UserModel, as: 'customer' },
        { model: QuotationItemModel },
        {
          model: BookingSiteAddressModel,
          include: [
            { model: CountryModel },
            { model: DistrictModel },
            { model: CityModel },
          ],
        },
      ],
    });

    if (!booking) {
      throw NotFoundError('Booking not found!');
    }

    if (booking?.status !== BookingStatus.RESERVED) {
      throw BadRequestError(
        `You can't pay when booking status is ${booking?.status}`,
      );
    }

    const additionalServicesAmount = booking?.orders?.[0]?.total_amount || 0;
    const totalAmount =
      booking?.renewals?.[0]?.total_amount + additionalServicesAmount;
    const amount = parseFloat(totalAmount.toFixed(2));
    const siteAddress = `${booking?.site_address?.street} ${
      booking?.site_address?.flat || ''
    } ${booking?.site_address?.district?.name_en}, ${
      booking?.site_address?.city?.name_en
    }, ${booking?.site_address?.country?.name_en} - ${
      booking?.site_address?.postal_code || ''
    }`;

    const currency = booking?.currency.toLowerCase() || '';
    const renewalId = booking?.renewals?.[0]?.id;
    const t = await this.sequelize.transaction();
    let charge;
    // eslint-disable-next-line no-restricted-syntax
    console.log(
      'TEST_CHECKOUT_ISSUE: amount, currency: ',
      booking?.id,
      amount,
      currency,
    );

    const chargeAmount = this.stripeService.calculateAmountInCurrency(
      amount,
      currency,
    );

    try {
      const [transactionShortId, invoiceId] = await Promise.all([
        this.idCounterService.generateTransactionId(),
        this.idCounterService.generateInvoiceId(),
      ]);

      const stripeCustomer = await this.stripeService.getStripeCustomerId(
        booking?.customer_id,
        payload?.token,
        booking?.customer_email,
        booking?.customer_phone_number,
      );
      const stripeCustomerId = stripeCustomer.id;

      // update in user if stripe customer info is create/updated
      if (stripeCustomer.isUpdated) {
        await this.userService.updateCustomerCard(
          booking?.customer_id,
          stripeCustomerId,
          t,
        );
      }

      const card = await this.stripeService.retrieveCard(stripeCustomerId);

      charge = await this.stripeService.charge(
        chargeAmount,
        currency,
        stripeCustomerId,
        `Payment for booking # ${booking.short_id}`,
      );

      const transactionPayload: Partial<ITransactionEntity> = {
        short_id: transactionShortId,
        invoice_id: invoiceId,
        stripe_charge_id: charge?.id,
        order_id: booking?.orders?.[0]?.id || null,
        stripe_customer_id: stripeCustomerId,
        card_last_digits: card?.last4,
        card_brand_name: card?.brand,
        amount,
        currency,
        booking_id: booking?.id,
        type: booking?.orders?.length
          ? TransactionType.BOOKING_ORDER
          : TransactionType.BOOKING,
        user_id: userId,
      };

      const transaction = await this.transactionService.create(
        transactionPayload,
        { t },
      );

      // create redeem entry if promotion was applied
      if (booking?.renewals?.[0]?.booking_promotion_id) {
        const redeemPayload: ICreateRedeemPayload = {
          booking_id: booking.id,
          promotion_id: booking?.renewals?.[0]?.promotion_id,
          booking_promotion_id: booking?.renewals?.[0]?.booking_promotion_id,
          customer_id: booking?.customer_id,
          renewal_id: booking?.renewals?.[0]?.id,
        };
        await this.promotionRedeemService.create(redeemPayload, { t });
      }

      // update the order status to confirmed
      if (booking?.orders?.[0]?.id) {
        const orderHistoryPayload: Omit<
          IOrderHistoryEntity,
          'id' | 'created_at' | 'updated_at'
        > = {
          booking_id: booking?.id,
          order_id: booking?.orders?.[0]?.id,
          status: OrderStatus.CONFIRMED,
          note: 'Your order has been confirmed!',
          changed_by: booking?.orders?.[0]?.customer_id,
        };

        await Promise.all([
          this.orderEntity.update(
            { status: OrderStatus.CONFIRMED },
            {
              where: { id: booking?.orders?.[0]?.id },
              transaction: t,
            },
          ),
          this.orderHistoryService.upsert(orderHistoryPayload, { t }),
        ]);
      }

      const renewalPayload: Partial<IRenewalEntity> = {
        transaction_id: transaction?.id,
        status: RenewalStatus.PAID,
        renewal_paid_date: new Date(),
      };

      const bookingHistoryPayload: BookingHistoryCreate = {
        status: BookingStatus.CONFIRMED,
        booking_id: booking?.id,
        note: 'Your booking has been confirmed',
        changed_by: booking?.customer_id,
      };

      const bookingPromises: any[] = [
        this.renewalService.update(renewalId, renewalPayload, { t }),
        this.bookingEntity.update(
          { status: BookingStatus.CONFIRMED },
          { where: { id: { [Op.eq]: booking?.id } }, transaction: t },
        ),
        this.bookingHistoryService.upsert(bookingHistoryPayload, { t }),
      ];

      if (booking?.quotation_item?.quotation_id) {
        bookingPromises.push(
          this.quotationEntity.update(
            {
              status: QuotationStatus.ACCEPTED,
            },
            {
              where: { id: booking?.quotation_item?.quotation_id },
              transaction: t,
            },
          ),
          this.quotationItemEntity.update(
            {
              booking_id: booking?.id,
            },
            {
              where: {
                quotation_id: booking?.quotation_item?.quotation_id,
                site_id: booking?.site_id,
                space_id: booking?.space_id,
              },
              transaction: t,
            },
          ),
        );
      }
      await Promise.all(bookingPromises);

      await t.commit();

      const promises = [];

      // send booking confirmation email to customer
      promises.push(
        this.notificationService.sendEmail(booking.customer_email, {
          data: {
            booking_id: booking.short_id,
            move_in_date: dayjs(booking.move_in_date).format('DD-MM-YYYY'),
            name: booking.customer_name || '',
            total_price: `${amount}${booking?.currency_sign}`,
            site_address: siteAddress,
            transaction_id: transaction?.id,
            web_domain_url: getClientBaseUrl(
              booking?.site_address?.country?.name_en,
            ),
          },
          template_id: getEmailTemplateT(
            TemplateNames.BOOKING_CONFIRMED,
            booking.customer?.preferred_language,
          ),
          country: booking.site_address?.country?.name_en,
          sendToCS: true,
        }),
      );

      // send notification to provider
      promises.push(
        this.notificationService.sendEmail(booking.provider?.email, {
          data: {
            booking_id: booking.short_id,
            move_in_date: dayjs(booking.move_in_date).format('DD-MM-YYYY'),
            name: booking.provider.first_name || '',
          },
          template_id: getEmailTemplateT(
            TemplateNames.HOST_NEW_RESERVATION,
            booking.provider?.preferred_language,
          ),
        }),
      );
      await Promise.all(promises);

      return { success: true };
    } catch (err) {
      const transaction = await this.sequelize.transaction();

      if (!charge) {
        const renewalPayload: Partial<IRenewalEntity> = {
          status: RenewalStatus.FAILED,
        };

        try {
          await this.renewalService.update(renewalId, renewalPayload, {
            t: transaction,
          });

          await transaction.commit();
        } catch (e) {
          await transaction.rollback();
        }
      }

      if (charge) {
        await this.stripeService.refund(charge?.id);
      }

      this.logger.error('Pay Booking Error:', err?.stack);
      await t.rollback();
      throw err;
    }
  }

  public async updateBookingsStatus(
    status: BookingStatus,
    where: IBookingsFilter,
  ): Promise<{ modified: number; bookings: BookingModel[] }> {
    this.logger.setContext(BookingService.name);
    this.logger.log(`update with where: ${JSON.stringify(where)}`);

    const filter = {
      status: where?.status,
      created_at: where?.created_at,
      move_in_date: where?.move_in_date,
      move_out_date: where?.move_out_date,
    };

    const whereFilter: WhereOptions = toSequelizeComparator(filter);

    const [modified, bookings] = await this.bookingEntity.update(
      {
        status,
      },
      {
        where: whereFilter,
        returning: true,
      },
    );

    return { modified, bookings };
  }

  public async updateReviewSchedule(
    review_status: ReviewStatus,
    updateBookingIds: number[],
  ): Promise<{ modified: number; bookings: BookingModel[] }> {
    const [modified, bookings] = await this.bookingEntity.update(
      {
        review_status,
      },
      {
        where: {
          id: { [Op.in]: updateBookingIds },
        },
        returning: true,
      },
    );

    return { modified, bookings };
  }

  // eslint-disable-next-line complexity
  private async getUpdateBookingPayload(
    payload: UpdateBookingPayload,
    where: UpdateBookingFilter,
    args: IBookingArgs,
  ) {
    // only admin can change the status of the booking
    if (
      (payload?.status === BookingStatus.RESERVED ||
        payload?.status === BookingStatus.CONFIRMED ||
        payload?.status === BookingStatus.ACTIVE) &&
      args?.isAdmin
    ) {
      throw BadRequestError('You can not change booking to this status');
    }

    const booking = await this.bookingEntity.findByPk(where?.id?._eq, {
      include: [{ model: RenewalModel }],
    });

    if (!booking) {
      throw NotFoundError('Booking not found!');
    }

    if (
      booking?.status !== BookingStatus.RESERVED &&
      payload?.status === BookingStatus.CANCELLED &&
      !booking?.move_out_date &&
      args?.isAdmin
    ) {
      throw BadRequestError('Move out date is required to cancel this booking');
    }

    const updateBookingPayload = {
      status: null,
      insurance_id: null,
      is_insured: null,
      insurance_amount: 0,
      total_amount: 0,
      total_tax_amount: booking.total_tax_amount,
      insurance_tax: 0,
    };

    if (args?.isAdmin) {
      updateBookingPayload.status = payload?.status;
      delete updateBookingPayload.insurance_id;
      delete updateBookingPayload.is_insured;
      delete updateBookingPayload.insurance_amount;
      delete updateBookingPayload.total_amount;
    }

    if (args?.isCustomer && booking?.status !== BookingStatus.RESERVED) {
      throw BadRequestError('Reserved Booking is required to add insurance');
    }

    let appliedTaxes: ICalculateTexResp;
    // only customer can add insurance to the reserved booking
    if (args?.isCustomer && booking?.status === BookingStatus.RESERVED) {
      if (!payload?.insurance_id) {
        throw BadRequestError('insurance_id is required');
      }

      const insurance = await this.insuranceService.getById(
        payload?.insurance_id,
      );

      if (!insurance) {
        throw BadRequestError('No insurance found with this insurance id');
      }

      const insuranceAmount = insurance?.price_per_day * 30 || 0;
      const oldInsuranceAmount = booking?.renewals?.[0]?.insurance_amount || 0;

      const bookingTaxes = await this.appliedTaxService.getByBookingId(
        booking.id,
      );
      this.logger.log(
        `Booking taxes for ${booking?.short_id}: ${
          bookingTaxes?.length
        } - ${JSON.stringify(bookingTaxes)}`,
      );

      const insuranceTaxIds = [];
      const oldInsuranceTaxAmount = bookingTaxes.reduce((prevTotal, tax) => {
        if (tax.entity_type === TaxEntityType.INSURANCE) {
          insuranceTaxIds.push(tax.id);
          return prevTotal + tax.tax_amount;
        }
        return prevTotal;
      }, 0);

      this.logger.log(
        `Old Insurance Tax Amount for ${booking?.short_id}: ${oldInsuranceTaxAmount}`,
      );
      this.logger.log(
        `Removing insurance taxes for ${booking?.short_id}: ${insuranceTaxIds}`,
      );

      await this.appliedTaxService.deleteByIds(insuranceTaxIds);

      // calculate tax
      const taxes = await this.appliedTaxService.calculateTax({
        insurance_id: payload?.insurance_id,
        insurance_price: insuranceAmount,
      });
      appliedTaxes = taxes;

      updateBookingPayload.insurance_tax = taxes.totalTax;
      updateBookingPayload.insurance_amount = insuranceAmount;

      // on create booking, tax was only for site/space, include insurance one as well.
      updateBookingPayload.total_tax_amount = parseFloat(
        (
          booking.total_tax_amount +
          taxes.totalTax -
          oldInsuranceTaxAmount
        ).toFixed(2),
      );
      updateBookingPayload.total_amount = parseFloat(
        (
          booking?.total_amount +
          taxes.totalTax +
          insuranceAmount -
          oldInsuranceAmount -
          oldInsuranceTaxAmount
        ).toFixed(2),
      );

      updateBookingPayload.insurance_id = payload?.insurance_id;
      updateBookingPayload.is_insured = true;
      delete updateBookingPayload.status;
    }

    return { updateBookingPayload, booking, appliedTaxes };
  }

  public async update(
    payload: UpdateBookingPayload,
    where: UpdateBookingFilter,
    args: IBookingArgs,
  ): Promise<UpdateBookingResp> {
    this.logger.setContext(BookingService.name);
    this.logger.log(
      `update with where: ${where?.id?._eq} -> ${JSON.stringify(
        where,
      )} and payload ${JSON.stringify(payload)}`,
    );

    const t = await this.sequelize.transaction();

    const {
      updateBookingPayload,
      booking,
      appliedTaxes,
    } = await this.getUpdateBookingPayload(payload, where, args);

    try {
      await this.bookingEntity.update(updateBookingPayload, {
        where: { id: where?.id?._eq },
        transaction: t,
      });

      // update the insurance related things in renewals
      if (updateBookingPayload?.is_insured) {
        const renewalPayload: Partial<IRenewalEntity> = {
          insurance_id: payload?.insurance_id,
          insurance_amount: updateBookingPayload?.insurance_amount,
          total_amount: parseFloat(
            updateBookingPayload.total_amount.toFixed(2),
          ),
          total_tax_amount: updateBookingPayload.total_tax_amount,
        };

        if (appliedTaxes?.totalTax > 0) {
          await this.appliedTaxService.createAppliedTaxes(
            appliedTaxes.taxes,
            booking.id,
            {
              t,
              userId: args.user_id,
              renewalId: booking?.renewals?.[0]?.id,
              insuranceId: payload.insurance_id,
            },
          );
        }

        // update projected amounts
        const nextRenewalSubTotal =
          booking?.renewals?.[0]?.next_renewal_sub_total;
        if (nextRenewalSubTotal) {
          const { total, discount } = await this.getRenewalProjectedAmount(
            booking,
            nextRenewalSubTotal,
            2,
            payload?.insurance_id,
            updateBookingPayload?.insurance_amount,
          );
          renewalPayload.next_renewal_total = total;
          renewalPayload.next_renewal_discount = discount;
        }

        await this.renewalService.update(
          booking?.renewals?.[0]?.id,
          renewalPayload,
          { t },
        );
      }

      await t.commit();

      return {
        modified: 1,
        edges: [await this.getById(where)],
      };
    } catch (e) {
      this.logger.error('Update Booking Error:', e?.stack);

      await t.rollback();

      throw e;
    }
  }

  public async cancelBooking(
    payload: CancelBookingPayload,
    userId: number,
  ): Promise<CancelBookingResponse> {
    const booking = await this.bookingEntity.findOne({
      where: {
        id: payload?.booking_id,
        customer_id: userId,
        status: BookingStatus.CONFIRMED,
      },
      include: [
        { model: TransactionModel, include: [OrderModel] },
        { model: RenewalModel },
        { model: UserModel, as: 'customer' },
      ],
    });

    if (!booking) {
      throw NotFoundError('No booking found or booking is already cancelled!');
    }

    if (dayjs(booking?.move_in_date).hour(0) <= dayjs()) {
      throw BadRequestError(
        'You can not cancel booking with move in date less than or equal to current date',
      );
    }

    // Setting dates without time
    const moveInDate = dayjs(booking?.move_in_date)
      .hour(0)
      .minute(0)
      .second(0)
      .millisecond(0)
      .utc(true);
    const currentDate = dayjs()
      .add(1, 'day')
      .hour(0)
      .minute(0)
      .second(0)
      .millisecond(0)
      .utc(true);

    const t = await this.sequelize.transaction();
    const differenceInDays = moveInDate.diff(currentDate, 'day');
    const {
      currency,
      depositedAmount,
      insuranceAmount,
      orderAmount,
      stripeChargeId,
      totalAmount,
    } = BookingService.getRefundPayloadFromBooking(booking);
    // In case negative result
    const rentAmount = Math.max(
      totalAmount - insuranceAmount - orderAmount - depositedAmount,
      0,
    );
    let refundAmount: number;
    let penaltyPercent = 0;

    // we will refund full amount if cancellation is made 14 days before the move in date
    if (differenceInDays >= 14) {
      refundAmount = totalAmount;
      penaltyPercent = 0;
    }
    // we will refund 50% rent amount & full deposit amount if cancellation is made 7 days before move in date
    if (differenceInDays >= 7 && differenceInDays <= 13) {
      refundAmount =
        rentAmount * 0.5 + depositedAmount + insuranceAmount + orderAmount;
      penaltyPercent = 50;
    }
    // we will take all rent amount and refund deposit, insurance and order amount (if exist)
    if (differenceInDays < 7) {
      refundAmount = depositedAmount + insuranceAmount + orderAmount;
      penaltyPercent = 100;
    }

    await this.bookingHistoryService.upsert(
      {
        booking_id: booking.id,
        changed_by: userId,
        status: BookingStatus.CANCELLED,
        note: 'Cancelled by Customer',
      },
      { t },
    );

    refundAmount = parseFloat(refundAmount.toFixed(2));

    booking.status = BookingStatus.CANCELLED;
    booking.cancellation_reason_note = payload.cancellation_note;
    booking.cancellation_reason_id = payload.cancellation_reason_id;

    await booking.save({ transaction: t });

    const refundId = await this.refundService.refund(
      {
        currency,
        penaltyPercent,
        amount: refundAmount,
        bookingId: booking.id,
        chargeId: stripeChargeId,
        type: RefundType.REFUND_CANCEL_BOOKING,
      },
      {
        stripe_customer_id: booking?.customer?.stripe_customer_id || null,
        user_id: booking?.customer_id,
      },
      { t },
    );

    await t.commit();

    if (!refundId) {
      throw InternalServerError('Error occurred while processing refund!');
    }

    return {
      id: refundId,
      refunded_amount: refundAmount,
      penalty_applied: totalAmount !== refundAmount,
      penalty_percent: penaltyPercent,
    };
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  static getRefundPayloadFromBooking(booking: BookingModel) {
    const transactions = booking?.transactions || [];
    let stripeChargeId = transactions?.[0]?.stripe_charge_id ?? '';
    const insuranceAmount = booking?.renewals?.[0]?.insurance_amount ?? 0;
    const depositedAmount = booking?.renewals?.[0]?.deposit_amount ?? 0;
    const totalAmount = transactions?.[0]?.amount ?? 0;
    const orderAmount = transactions?.[0]?.order?.total_amount ?? 0;
    const currency = transactions?.[0]?.currency;
    let unusedDaysOption: IUnusedDaysOption | undefined;
    const termination = booking?.termination;

    // If we need to refund unused days for customer who request termination or have move out date
    if (termination && termination.unused_days_amount >= 1) {
      unusedDaysOption = {
        amount: termination.unused_days_amount,
        chargeId: termination.renewal?.transaction?.stripe_charge_id,
      };
    }

    // find the latest stripe transaction and refund on that
    // instead of refunding on first deposit transaction
    // As if customer has changed the card, that'd be in latest transactions
    // Shouldn't refund on old(first transaction) card
    for (let i = transactions.length - 1; i >= 0; i--) {
      const transaction = transactions[i];
      if (
        transaction.amount >= depositedAmount &&
        transaction.stripe_charge_id !== unusedDaysOption?.chargeId
      ) {
        //
        stripeChargeId = transaction.stripe_charge_id;
        break;
      }
    }

    return {
      stripeChargeId,
      insuranceAmount,
      depositedAmount,
      totalAmount,
      orderAmount,
      currency,
      unusedDaysOption,
    };
  }

  async getCancellationInfo(bookingId: number): Promise<BookingCancellation> {
    const booking = await this.bookingEntity.findOne({
      where: {
        id: bookingId,
        status: BookingStatus.CANCELLED,
      },
      include: [RefundModel, BookingCancellationReasonsModel],
    });

    if (!booking || !booking.refund) {
      return null;
    }

    return {
      id: booking.refund?.id,
      refunded_amount: booking.refund?.refunded_amount,
      refund_date: booking.refund?.refunded_date,
      penalty_percent: booking.refund?.penalty_percent,
      cancellation_note: booking.cancellation_reason_note,
      cancellation_reason: booking.cancellation_reason,
    };
  }

  public async markBookingAsReviewed(bookingId: number): Promise<void> {
    await this.bookingEntity.update(
      { review_status: ReviewStatus.REVIEWED },
      {
        where: { id: { [Op.eq]: bookingId } },
      },
    );
  }

  public async markBookingAsRemindedReview(bookingId: number): Promise<void> {
    await this.bookingEntity.update(
      { review_status: ReviewStatus.REMINDED },
      {
        where: { id: { [Op.eq]: bookingId } },
      },
    );
  }

  public getCommitmentDays(
    startDate: Date,
    endDate: Date = null,
    commitmentMonths = 0,
  ): number {
    let months = commitmentMonths;
    if (endDate) {
      months = dayjs(endDate).diff(dayjs(startDate), 'month', true);
    }

    return months * 30;
  }

  private async updateRenewalProjectedAmount(
    booking: BookingModel,
    nextRenewalSubTotal: number,
    renewalId: number,
  ): Promise<void> {
    try {
      const { sub_total, discount } = await this.getRenewalProjectedAmount(
        booking,
        nextRenewalSubTotal,
        2,
      );

      await this.renewalService.update(renewalId, {
        next_renewal_sub_total: nextRenewalSubTotal,
        next_renewal_total: sub_total,
        next_renewal_discount: discount,
      });
    } catch (e) {
      // console silently
      this.logger.error(
        `ERROR WHILE UPDATING PROJECTED RENEWAL AMOUNT FOR BOOKING ${booking.short_id}`,
        e?.stack,
      );
    }
  }

  public async getRenewalProjectedAmount(
    booking: BookingModel,
    nextRenewalSubTotal: number,
    forMonth: number,
    insuranceId: number = null,
    insuranceAmount: number = null,
  ): Promise<{
    sub_total: number;
    total: number;
    discount: number;
  }> {
    const insurancePrice = insuranceAmount
      ? insuranceAmount
      : booking.insurance_amount ?? 0;

    // apply promotion if any
    const promotionInfo = await this.bookingPromotionService.getBookingPromotionAmount(
      booking.base_amount,
      booking,
      forMonth,
    );
    // calculate tax
    const taxes = await this.appliedTaxService.calculateTax({
      site_id: booking?.site_id,
      insurance_id: insuranceId || booking?.insurance_id,
      space_price:
        promotionInfo.discounted_amount > 0
          ? nextRenewalSubTotal - promotionInfo.discounted_amount
          : nextRenewalSubTotal,
      insurance_price: insurancePrice,
    });

    const projectedTotal = parseFloat(
      (
        nextRenewalSubTotal +
        insurancePrice +
        taxes.totalTax -
        promotionInfo.discounted_amount
      ).toFixed(2),
    );

    return {
      sub_total: nextRenewalSubTotal,
      total: projectedTotal,
      discount: promotionInfo.discounted_amount,
    };
  }

  /**
   * Customer can request to change unit of existing ACTIVE booking
   * This API is responsible to change the unit of booking within same site/building
   * It will refund old deposit and charge new deposit + refund unused days and change unused days with new price per month
   *
   * 1. If the price of new unit is different, then REFUND deposit and create new charge for DEPOSIT
   * 2. Param "apply=false" means it will only send response back to client what will happen, this won't actually apply this change
   * 3. Param "apply_immidiately=true" means:
   *    It will apply the change immidiately from tomorrow
   *    which means it will calculate remaining days of current renewal
   *    Then refund remaining day with current price (after calculating tax and promotions if applied)
   *    Then charge remaining days with new price (after calculating tax and promotions if applied)
   *    (it means this one month would have two partial renewal entries)
   * 4. Add all information into booking history
   * 5. Upate new deposit and base price in booking
   */
  // eslint-disable-next-line complexity
  public async changeBookingUnit(
    payload: ChangeBookingUnitPayload,
    user: IAuthUser,
  ): Promise<ChangeBookingUnitResp> {
    this.logger.setContext(BookingService.name);
    this.logger.log(
      `[ChangeBookingUnit] ${payload.short_id} with: ${JSON.stringify(
        payload,
      )}`,
    );

    //
    let t: Transaction;
    let depositCharge;
    let renewalCharge;
    try {
      const [booking, space] = await Promise.all([
        this.bookingEntity.findOne({
          where: {
            short_id: payload.short_id,
            status: BookingStatus.ACTIVE,
          },
          include: [
            { model: UserModel, as: 'customer' },
            { model: BookingPromotionModel },
            { model: RenewalModel },
            { model: AppliedTaxModel },
          ],
          order: [[{ model: RenewalModel, as: 'renewals' }, 'id', 'DESC']],
        }),
        this.spaceEntity.findOne({
          where: {
            id: payload.new_space_id,
            status: SpaceStatus.ACTIVE,
          },
          include: [
            {
              required: true,
              model: PriceModel,
              where: { type: PriceType.BASE_PRICE },
            },
          ],
        }),
      ]);

      if (!booking || !space) {
        throw NotFoundError('No active booking or space found with this ID');
      }

      if (space.site_id !== booking.site_id) {
        throw BadRequestError('New unit should be in same site/building');
      }

      if (payload.new_space_id === booking.space_id) {
        throw BadRequestError('Please select different unit');
      }

      if (booking.is_termination_requested) {
        throw BadRequestError(
          'Termination is already requested for this booking.',
        );
      }

      const today = dayjs();
      if (
        booking.move_out_date &&
        dayjs(booking.move_out_date).diff(today, 'month') <= 1
      ) {
        throw BadRequestError('Booking has move out date within a month');
      }

      //
      if (booking.renewals[0]?.status !== RenewalStatus.PAID) {
        throw BadRequestError('Last renewals is not yet paid.');
      }

      const lastPaidRenewal = booking.renewals.find(
        (renewal) => renewal.status === RenewalStatus.PAID,
      );

      if (!lastPaidRenewal) {
        throw BadRequestError('No paid renewal found');
      }

      if (!lastPaidRenewal?.next_renewal_date) {
        throw BadRequestError(
          'This seems the last renewal, there is no next renewal date',
        );
      }

      this.logger.log(
        `[ChangeBookingUnit] ${payload.short_id} - ${booking.move_in_date} - ${booking.move_out_date}`,
      );

      // get tax which is applied on monthly rent only
      const appliedTaxes = (booking.applied_taxes as undefined) as AppliedTaxModel[];
      const renewalTax = appliedTaxes.find(
        (tax) =>
          tax.renewal_id === lastPaidRenewal.id &&
          tax.entity_type === TaxEntityType.SITE,
      );
      this.logger.log(
        `[ChangeBookingUnit] ${
          payload.short_id
        } monthly taxes on last renewal ${JSON.stringify(
          renewalTax?.toJSON(),
        )}`,
      );

      //
      //
      t = await this.sequelize.transaction();
      const currency = booking?.currency.toLowerCase() || '';
      const promises = [];
      const refundsPayload = [];
      const newPricePerMonth = space?.prices[0]?.price_per_month;
      this.logger.log(
        `[ChangeBookingUnit] ${payload.short_id} - ${newPricePerMonth}`,
      );

      //
      // Charge new deposit and refund old deposit
      if (payload.apply && booking.deposited_amount !== newPricePerMonth) {
        // charge new deposit
        depositCharge = await this.payUnitChangeAmount(
          booking,
          TransactionType.BOOKING,
          {
            t,
            userId: user?.user_id,
            amount: parseFloat(newPricePerMonth.toFixed(2)),
            currency,
            // renewalId,
            note: `Update Unit - New Deposit - ${booking.short_id}`,
          },
        );

        // refund existing deposit
        refundsPayload.push({
          bookingId: booking?.id,
          amount: booking.deposited_amount,
          type: RefundType.REFUND_DEPOSIT,
          penaltyPercent: 0,
        });
      }

      //
      let unusedDays = 0;
      let unusedDaysAmountPaid = 0;
      let unusedDaysTaxAmountPaid = 0;
      let unusedDaysTotalPaid = 0;
      let unusedDaysAmountToBePaid = 0;
      // let unusedDaysToBePaid = 0;

      // max 30 days of month
      // let totalRenewalDays = dayjs(lastPaidRenewal.renewal_end_date).diff(
      //   dayjs(lastPaidRenewal.renewal_start_date),
      //   'days',
      // );
      // totalRenewalDays = totalRenewalDays > 30 ? 30 : totalRenewalDays;
      let nextRenewalStartDate = dayjs(lastPaidRenewal.next_renewal_date);

      //
      //
      if (
        payload.apply_immidiately &&
        dayjs(lastPaidRenewal.renewal_end_date).isAfter(today.add(1, 'day'))
      ) {
        //
        nextRenewalStartDate = dayjs().add(1, 'day');

        // TODO: Calculate promotion amount on PAID and To give discount on TO BE PAID amount

        unusedDays = dayjs(lastPaidRenewal.renewal_end_date).diff(
          today,
          'days',
        );
        unusedDays = unusedDays > 30 ? 30 : unusedDays;

        //
        unusedDaysAmountPaid = parseFloat(
          ((booking.base_amount / 30) * unusedDays).toFixed(2),
        );
        unusedDaysAmountPaid = Math.max(unusedDaysAmountPaid, 0);

        // calculate with tax paid
        if (renewalTax) {
          unusedDaysTaxAmountPaid = parseFloat(
            ((renewalTax.tax_amount / 30) * unusedDays).toFixed(2),
          );
          unusedDaysTaxAmountPaid = Math.max(unusedDaysTaxAmountPaid, 0);
        }

        unusedDaysTotalPaid = parseFloat(
          (unusedDaysAmountPaid + unusedDaysTaxAmountPaid).toFixed(2),
        );

        //
        unusedDaysAmountToBePaid = parseFloat(
          ((newPricePerMonth / 30) * unusedDays).toFixed(2),
        );
        unusedDaysAmountToBePaid = Math.max(unusedDaysAmountToBePaid, 0);

        //
        // calculate tax on "to be paid" amount
        const taxes = await this.appliedTaxService.calculateTax({
          site_id: booking.site_id,
          space_price: unusedDaysAmountToBePaid,
        });

        unusedDaysAmountToBePaid = parseFloat(
          (unusedDaysAmountToBePaid + taxes.totalTax).toFixed(2),
        );

        //
        // end current renewal and create new renewal
        if (payload.apply) {
          lastPaidRenewal.renewal_end_date = today.toDate();
          promises.push(lastPaidRenewal.save({ transaction: t }));
        }

        let renewal: Renewal;
        //
        // create new partial renewal
        const renewalPayload = this.renewalService.getRenewalPayload(
          0,
          0,
          nextRenewalStartDate.toDate(),
          null,
          booking?.id,
          newPricePerMonth,
          0,
          RenewalStatus.UN_PAID,
          RenewalType.PARTIAL_SUBSCRIPTION,
          null,
          booking.move_out_date,
        );

        //
        // only apply transactions if user want to apply, otherwise just calculate values
        if (payload.apply) {
          //
          renewal = await this.renewalService.create(
            {
              ...renewalPayload,
              booking_promotion_id: null,
              promotion_id: null,
              renewal_paid_date: new Date(),
              total_tax_amount: taxes.totalTax,
              total_amount: unusedDaysAmountToBePaid,
            },
            { t },
          );

          promises.push(
            this.appliedTaxService.createAppliedTaxes(taxes.taxes, booking.id, {
              t,
              userId: user?.user_id,
              renewalId: renewal?.id,
            }),
          );

          //
          // Charge unused days new renewal and refund already paid one for unused days
          renewalCharge = await this.payUnitChangeAmount(
            booking,
            TransactionType.RENEWAL,
            {
              t,
              userId: user?.user_id,
              amount: unusedDaysAmountToBePaid,
              currency,
              renewalId: renewal?.id,
              note: `Update Unit - Space Amount - ${booking.short_id}`,
            },
          );

          // refund unused days
          refundsPayload.push({
            bookingId: booking?.id,
            amount: unusedDaysTotalPaid,
            type: RefundType.REFUND_UNUSED_DAYS,
            penaltyPercent: 0,
          });
        }
      }

      //
      const respData = {
        ...payload,
        old_space_id: booking.space_id,
        old_space_price: booking.base_amount,
        new_space_price: newPricePerMonth,
        is_changed: payload.apply,
        deposit_refunded_amount: booking.deposited_amount,
        deposit_charged_amount: newPricePerMonth,
        unused_days: unusedDays,
        unused_days_amount: unusedDaysAmountPaid,
        unused_days_tax_amount: unusedDaysTaxAmountPaid,
        refunded_unused_days: unusedDaysTotalPaid,
        charged_unused_days: unusedDaysAmountToBePaid,
      };
      const notes = `[CHANGE SPACE UNIT] - ${JSON.stringify(respData)}`;

      const resp: ChangeBookingUnitResp = {
        ...respData,
        message: notes,
        details: {
          ...respData,
          new_space: space,
          booking,
        },
      };

      //
      if (!payload.apply) {
        return resp;
      }

      //
      booking.deposited_amount = newPricePerMonth;
      booking.base_amount = newPricePerMonth;
      booking.space_id = space?.id;
      promises.push(booking.save({ transaction: t }));

      //
      const bookingHistoryPayload: BookingHistoryCreate = {
        status: booking.status,
        booking_id: booking?.id,
        note: notes,
        old_base_amount: booking.base_amount,
        base_amount: newPricePerMonth,
        old_space_id: booking?.space_id,
        new_space_id: payload?.new_space_id,
        old_deposit: booking.deposited_amount,
        new_deposit: newPricePerMonth,
        changed_by: user?.user_id,
      };
      promises.push(
        this.bookingHistoryService.upsert(bookingHistoryPayload, { t }),
      );

      await Promise.all(promises);
      await t.commit();

      resp.message = 'Successfully processed';

      // when everything is passed, now refund the old amounts (deposit + unused days)
      const tr = await this.sequelize.transaction();
      try {
        await Promise.all(
          refundsPayload.map((p) =>
            this.refundService.refund(
              p,
              {
                user_id: user?.user_id,
                stripe_customer_id:
                  booking?.customer?.stripe_customer_id || null,
              },
              { t: tr },
            ),
          ),
        );
        this.logger.log(
          `[ChangeBookingUnit] REFUNDED ${booking.short_id}. ${JSON.stringify(
            refundsPayload,
          )}`,
        );
      } catch (error) {
        resp.message = `Error while refunding amount for ${booking.short_id}. Please talk to admin`;
        this.logger.error(
          `[ChangeBookingUnit] REFUND ERROR ${
            booking.short_id
          }. Please talk to admin. ${JSON.stringify(refundsPayload)}`,
          error?.stack,
        );
        await tr.rollback();
      }

      this.logger.log(
        `[ChangeBookingUnit] ${payload.short_id} Changed. ${JSON.stringify(
          respData,
        )}`,
      );
      return resp;
    } catch (err) {
      this.logger.error('[ChangeBookingUnit] Error:', err?.stack);

      if (depositCharge) {
        try {
          await this.stripeService.refund(depositCharge?.id);
        } catch (e) {
          this.logger.error(
            `[ChangeBookingUnit] NEW REFUND ERROR ${payload.short_id}`,
          );
        }
      }

      if (renewalCharge) {
        try {
          await this.stripeService.refund(renewalCharge?.id);
        } catch (e) {
          this.logger.error(
            `[ChangeBookingUnit] NEW RENEWAL REFUND ERROR ${payload.short_id}`,
          );
        }
      }

      if (t) {
        await t.rollback();
      }

      throw err;
    }
  }

  public async addPromotionsToBooking(
    payload: AddPromotionsToBookingPayload,
    user: IAuthUser,
  ): Promise<AddPromotionsToBookingResp> {
    this.logger.setContext(BookingService.name);
    this.logger.log(
      `[ADD PROMOTION TO BOOKING] ${payload.short_id} ${JSON.stringify(
        payload,
      )}`,
    );

    //
    if (!payload.promo_code && !payload.promotion_id) {
      throw BadRequestError('Please specify promotions to be applied!');
    }

    //
    let t;
    try {
      const booking = await this.bookingEntity.findOne({
        where: {
          short_id: payload.short_id,
          status: BookingStatus.ACTIVE,
        },
        include: [{ model: BookingPromotionModel }, { model: RenewalModel }],
        order: [[{ model: RenewalModel, as: 'renewals' }, 'id', 'DESC']],
      });

      if (!booking) {
        throw NotFoundError('No active booking found with this ID');
      }

      if (
        payload.promo_code &&
        booking.promotions.find((p) => p.format === PromotionFormat.VOUCHER)
      ) {
        throw BadRequestError(
          'Voucher promotion is already applied to this booking',
        );
      }

      if (
        payload.promotion_id &&
        booking.promotions.find((p) => p.format === PromotionFormat.PUBLIC)
      ) {
        throw BadRequestError(
          'Public promotion is already applied to this booking',
        );
      }

      if (!booking.renewals[0].next_renewal_date) {
        throw BadRequestError(
          'Booking already have last renewal, cannot apply promotion',
        );
      }

      const promotionInfo = await this.promotionService.getPromotionAmount(
        booking.site_id,
        booking.base_amount,
        booking.renewals[0].renewal_start_date,
        booking.move_out_date,
        payload?.promo_code,
        payload?.promotion_id,
      );

      if (payload.promotion_id && !promotionInfo.public_promotion) {
        throw BadRequestError(
          `ID ${payload.promotion_id} cannot be applied. Either promotion not found or commitment months are not fulfilling`,
        );
      }

      if (payload.promo_code && !promotionInfo.promotion) {
        throw BadRequestError(
          `Code ${payload.promo_code} cannot be applied. Either promotion not found or commitment months are not fulfilling`,
        );
      }

      if (!payload.apply) {
        return {
          is_applied: payload.apply,
          message: 'Promotions not applied yet',
          details: promotionInfo,
        };
      }

      t = await this.sequelize.transaction();
      const promises = [];
      let bookingPromoId = null;
      let bookingPublicPromoId = null;

      if (promotionInfo.promotion) {
        bookingPromoId = (
          await this.bookingPromotionService.create(
            promotionInfo.promotion.id,
            {
              t,
              booking_id: booking.id,
              applied_at: booking.renewals[0].next_renewal_date,
            },
          )
        ).id;
      }

      // for public promotion which will apply on next renewals
      if (promotionInfo.public_promotion) {
        bookingPublicPromoId = (
          await this.bookingPromotionService.create(
            promotionInfo.public_promotion?.id,
            {
              t,
              booking_id: booking.id,
              applied_at: booking.renewals[0].next_renewal_date,
            },
          )
        ).id;
      }

      // if promotion was applied, then create booking promotion entries and redeem entry
      if (promotionInfo.promotion) {
        promises.push(
          this.bookingPromotionService.createBuysGets(
            promotionInfo.promotion.id,
            {
              t,
              promotion_id: bookingPromoId,
            },
          ),
        );
      }

      if (promotionInfo.public_promotion) {
        promises.push(
          this.bookingPromotionService.createBuysGets(
            promotionInfo.public_promotion.id,
            {
              t,
              promotion_id: bookingPublicPromoId,
            },
          ),
        );
      }

      promises.push(
        this.bookingHistoryService.upsert(
          {
            status: booking.status,
            note: 'Promotions added to existing booking',
            booking_id: booking?.id,
            promotion_id: promotionInfo?.promotion?.id,
            public_promotion_id: promotionInfo?.public_promotion?.id,
            changed_by: user?.user_id,
          },
          { t },
        ),
      );

      //
      await Promise.all(promises);
      await t.commit();

      return {
        is_applied: payload.apply,
        message: 'Promotions applied',
        details: promotionInfo,
      };
    } catch (err) {
      this.logger.error('Add Promotion to Booking Error:', err?.stack);

      if (t) {
        await t.rollback();
      }

      throw err;
    }
  }

  private async payUnitChangeAmount(
    booking: BookingModel,
    type: TransactionType,
    args,
  ): Promise<Stripe.Charge> {
    const { amount, currency, userId, renewalId, t, note } = args;
    try {
      const [transactionShortId, invoiceId] = await Promise.all([
        this.idCounterService.generateTransactionId(),
        this.idCounterService.generateInvoiceId(),
      ]);

      const stripeCustomerId = booking?.customer?.stripe_customer_id || null;

      ///
      const chargeAmount = this.stripeService.calculateAmountInCurrency(
        amount,
        currency,
      );
      const card = await this.stripeService.retrieveCard(stripeCustomerId);
      const charge = await this.stripeService.charge(
        chargeAmount,
        currency,
        stripeCustomerId,
        note,
      );

      ///
      const transactionPayload: Partial<ITransactionEntity> = {
        short_id: transactionShortId,
        invoice_id: invoiceId,
        stripe_charge_id: charge?.id,
        stripe_customer_id: stripeCustomerId,
        card_last_digits: card?.last4,
        card_brand_name: card?.brand,
        amount,
        currency,
        booking_id: booking?.id,
        type,
        renewal_id: renewalId,
        user_id: userId,
      };

      await this.transactionService.create(transactionPayload, { t });

      return charge;
    } catch (err) {
      this.logger.error('Payment Error:', err?.stack);
      throw err;
    }
  }
}
