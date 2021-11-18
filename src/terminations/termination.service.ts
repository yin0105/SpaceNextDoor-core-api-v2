import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import dayjs, { Dayjs } from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { Op, Sequelize, WhereOptions } from 'sequelize';

import { UserModel } from '../auth/users/user.model';
import { BookingSiteAddressModel } from '../bookings/booking-site-addresses/booking-site-address.model';
import { BookingModel } from '../bookings/booking.model';
import { BookingPromotionCustomerBuysModel } from '../bookings/promotions/customer_buys/customer_buys.model';
import { BookingPromotionCustomerGetsModel } from '../bookings/promotions/customer_gets/customer_gets.model';
import { BookingPromotionModel } from '../bookings/promotions/promotion/promotion.model';
import { RenewalModel } from '../bookings/renewals/renewal.model';
import { ITransactionEntity } from '../bookings/transactions/interfaces/transaction.interface';
import { TransactionService } from '../bookings/transactions/transaction.service';
import { CountryModel } from '../countries/country.model';
import {
  BookingStatus,
  CalculateTerminationDuesResp,
  PayTerminationPayload,
  PayTerminationResp,
  PromotionBuyTypes,
  PromotionFormat,
  RenewalStatus,
  Termination,
  TerminationPayload,
  TerminationPaymentStatus,
  TerminationStatus,
  TransactionType,
} from '../graphql.schema';
import { IDCounterService } from '../ids_counter/ids_counter.service';
import {
  BOOKING_PROMOTION_REPOSITORY,
  BOOKING_REPOSITORY,
  RENEWAL_REPOSITORY,
  SEQUELIZE_PROVIDER,
  TERMINATION_REPOSITORY,
} from '../shared/constant/app.constant';
import { BadRequestError, NotFoundError } from '../shared/errors.messages';
import {
  getEmailTemplateT,
  TemplateNames,
} from '../shared/mailer/email-templates';
import { NotificationService } from '../shared/notifications/notification.service';
import { toSequelizeComparator } from '../shared/utils/graphql-to-sequelize-comparator';
import { StripeService } from '../stripe/stripe.service';
import {
  ICalculateTerminationDues,
  ITerminationFilter,
} from './interfaces/termination.interface';
import { TerminationModel } from './termination.model';
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

@Injectable()
export class TerminationService {
  private terminationNoticeDays: number;
  private notificationService: NotificationService;
  constructor(
    @Inject(SEQUELIZE_PROVIDER)
    private readonly sequelize: Sequelize,
    @Inject(TERMINATION_REPOSITORY)
    private readonly terminationEntity: typeof TerminationModel,
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingEntity: typeof BookingModel,
    @Inject(RENEWAL_REPOSITORY)
    private readonly renewalEntity: typeof RenewalModel,
    @Inject(BOOKING_PROMOTION_REPOSITORY)
    private readonly bookingPromotionEntity: typeof BookingPromotionModel,
    private readonly configService: ConfigService,
    private readonly stripeService: StripeService,
    private readonly transactionService: TransactionService,
    private readonly idCounterService: IDCounterService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(TerminationService.name);
    this.notificationService = new NotificationService();
    this.terminationNoticeDays = this.configService.get(
      'app.termination.noticeDays',
    );
    if (!this.terminationNoticeDays) {
      throw BadRequestError('Termination notice days is not set in config');
    }
  }

  public async getByBookingId(bookingId: number): Promise<Termination> {
    const termination = await this.terminationEntity.findOne({
      where: { booking_id: { [Op.eq]: bookingId } },
    });
    return (termination as undefined) as Termination;
  }

  public async updateTerminationStatus(
    status: TerminationStatus,
    where: ITerminationFilter,
  ): Promise<{ modified: number; terminations: TerminationModel[] }> {
    const filter = {
      status: where?.status,
      termination_date: where?.termination_date,
    };

    const whereFilter: WhereOptions = toSequelizeComparator(filter);

    const [modified, terminations] = await this.terminationEntity.update(
      {
        status,
      },
      {
        where: whereFilter,
        returning: true,
      },
    );

    return { modified, terminations };
  }

  public async calculateTerminationDues(
    payload: TerminationPayload,
    args: { user_id: number },
  ): Promise<CalculateTerminationDuesResp> {
    this.logger.log(
      `Calculate Termination with payload: ${JSON.stringify(payload)}`,
    );

    const {
      requestMoveOutDate,
      terminationDate,
      noticePeriodAmount,
      promoAmount,
      failedRenewalsAmount,
      remainingDaysAmount,
      totalAmount,
      currency,
      currencySign,
    } = await this.calculateTermination(payload, args);

    return {
      currency,
      currency_sign: currencySign,
      move_out_date: requestMoveOutDate.toDate(),
      termination_date: terminationDate.toDate(),
      failed_renewals_amount: failedRenewalsAmount,
      notice_period_amount: noticePeriodAmount,
      promotion_amount: promoAmount,
      remaining_days_amount: remainingDaysAmount,
      total_amount: totalAmount,
    };
  }

  public async requestTermination(
    payload: TerminationPayload,
    args: {
      user_id?: number;
      exclude_notice_dues?: boolean;
      use_move_out_date?: boolean;
      is_cron?: boolean;
    } = null,
  ): Promise<Termination> {
    this.logger.log(
      `Request Termination with payload: ${JSON.stringify(payload)}`,
    );
    this.logger.log(`Request Termination with args: ${JSON.stringify(args)}`);

    //
    const t = await this.sequelize.transaction();

    const renewals = await this.renewalEntity.findAll({
      where: { booking_id: { [Op.eq]: payload?.booking_id } },
      order: [['created_at', 'ASC']],
    });
    const lastRenewal =
      renewals.length > 0 ? renewals[renewals.length - 1] : null;

    const where: WhereOptions = {
      id: { [Op.eq]: payload.booking_id },
    };

    if (args?.user_id) {
      where.customer_id = { [Op.eq]: args.user_id };
    }

    const booking = await this.bookingEntity.findOne({
      where,
      include: [
        { model: UserModel, as: 'customer' },
        {
          model: BookingSiteAddressModel,
          include: [{ model: CountryModel }],
        },
      ],
    });

    try {
      const {
        requestMoveOutDate,
        terminationDate,
        noticePeriodAmount,
        promoAmount,
        failedRenewalsAmount,
        remainingDaysAmount,
        unusedDaysAmount,
        totalAmount,
      } = await this.calculateTermination(payload, args);

      const isOverDue = totalAmount > booking.deposited_amount;

      const createdTermination = await this.terminationEntity.create(
        {
          booking_id: payload.booking_id,
          last_renewal_id: lastRenewal?.id,
          move_out_date: payload.move_out_date,
          termination_date: terminationDate,
          notice_period_amount: noticePeriodAmount,
          promotion_amount: promoAmount,
          failed_renewals_amount: failedRenewalsAmount,
          remaining_days_amount: remainingDaysAmount,
          total_amount: totalAmount,
          is_overdue: isOverDue,
          status:
            totalAmount <= 0
              ? TerminationStatus.SCHEDULED
              : TerminationStatus.REQUESTED,
          currency: booking.currency,
          currency_sign: booking.currency_sign,
          is_auto_created: args?.is_cron || false,
          unused_days_amount: unusedDaysAmount,
        },
        { transaction: t },
      );

      //
      booking.move_out_date = payload.move_out_date;
      booking.is_termination_requested = true;
      await booking.save({ transaction: t });

      //
      await t.commit();

      // send email notification to customer
      await this.notificationService.sendEmail(booking.customer_email, {
        data: {
          booking_id: booking.short_id,
          move_out_date: requestMoveOutDate.format('DD-MM-YYYY'),
          termination_date: terminationDate.format('DD-MM-YYYY'),
          first_name: booking.customer_name || '',
        },
        template_id: getEmailTemplateT(
          TemplateNames.TERMINATION_REQUESTED,
          booking.customer?.preferred_language,
        ),
        country: booking.site_address?.country?.name_en,
        sendToCS: true,
      });

      return (createdTermination as undefined) as Termination;
    } catch (e) {
      this.logger.error('Create Termination Error:', e?.stack);

      await t.rollback();
      throw e;
    }
  }

  public async payTerminationDues(
    payload: PayTerminationPayload,
  ): Promise<PayTerminationResp> {
    this.logger.log(`Pay Termination with payload: ${JSON.stringify(payload)}`);

    const termination = await this.terminationEntity.findByPk(
      payload?.termination_id,
      {
        include: [
          {
            model: BookingModel,
            include: [{ model: UserModel, as: 'customer' }],
          },
        ],
      },
    );

    if (!termination) {
      throw BadRequestError('Termination not found!');
    }

    if (termination.payment_status === TerminationPaymentStatus.PAID) {
      throw BadRequestError('Termination amount already paid');
    }

    // if amount is 0, stipe would return error that it should be at least 1
    // so in that case just skip payment
    if (termination.total_amount < 1) {
      return { success: true };
    }

    const stripeCustomerId =
      termination.booking?.customer?.stripe_customer_id || null;
    if (!stripeCustomerId) {
      this.logger.log('No stripe customer id found with the user');
      throw BadRequestError('No stripe customer id found with the user');
    }

    //
    const t = await this.sequelize.transaction();

    const currency = termination.currency.toLowerCase() || '';

    const chargeAmount = this.stripeService.calculateAmountInCurrency(
      termination.total_amount,
      currency,
    );

    let charge;
    try {
      const card = await this.stripeService.retrieveCard(stripeCustomerId);

      charge = await this.stripeService.charge(
        chargeAmount,
        currency,
        stripeCustomerId,
        `Payment for termination booking # ${termination?.booking?.short_id}`,
      );

      const transactionShortId = await this.idCounterService.generateTransactionId();

      const invoiceId = await this.idCounterService.generateInvoiceId();

      const transactionPayload: Partial<ITransactionEntity> = {
        short_id: transactionShortId,
        invoice_id: invoiceId,
        stripe_charge_id: charge?.id,
        stripe_customer_id: stripeCustomerId,
        card_last_digits: card?.last4,
        card_brand_name: card?.brand,
        amount: termination.total_amount,
        currency,
        termination_id: termination.id,
        booking_id: termination.booking_id,
        type: TransactionType.TERMINATION,
        user_id: termination.booking?.customer_id,
      };

      termination.status = TerminationStatus.SCHEDULED;
      termination.payment_status = TerminationPaymentStatus.PAID;
      await Promise.all([
        termination.save({ transaction: t }),
        this.transactionService.create(transactionPayload, { t }),
      ]);

      await t.commit();

      return { success: true };
    } catch (err) {
      if (charge) {
        await this.stripeService.refund(charge.id);

        //
        termination.status = TerminationStatus.ON_HOLD;
        termination.payment_status = TerminationPaymentStatus.FAILED;
        await termination.save();
      }

      this.logger.error('Pay Termination Dues Error:', err?.stack);
      await t.rollback();
      throw err;
    }
  }

  // eslint-disable-next-line complexity
  private async calculateTermination(
    payload: TerminationPayload,
    args: {
      user_id?: number;
      exclude_notice_dues?: boolean;
      use_move_out_date?: boolean;
      is_cron?: boolean;
    } = null,
  ): Promise<ICalculateTerminationDues> {
    const currentDate = dayjs();
    const requestMoveOutDate = dayjs(payload.move_out_date);

    // limit the request termination frame-time up to 1 month
    if (requestMoveOutDate.isAfter(currentDate.add(1, 'month'))) {
      this.logger.error('Please chose move out date within 1 month');

      throw BadRequestError('Please chose move out date within 1 month');
    }

    // minimum notice period
    let terminationDate = dayjs().add(this.terminationNoticeDays, 'days');

    //
    if (args?.use_move_out_date || requestMoveOutDate > terminationDate) {
      terminationDate = requestMoveOutDate;
    }

    // use need to chose move out from tomorrow
    if (requestMoveOutDate.isBefore(currentDate.add(1, 'day'))) {
      this.logger.error('Move out date should be after today');

      throw BadRequestError('Move out date should be after today');
    }

    //
    const where: WhereOptions = {
      id: { [Op.eq]: payload.booking_id },
    };

    if (args?.user_id) {
      where.customer_id = { [Op.eq]: args.user_id };
    }

    const booking = await this.bookingEntity.findOne({ where });

    if (!booking) {
      throw NotFoundError('Booking not found!');
    }

    if (
      booking.status !== BookingStatus.ACTIVE &&
      booking.status !== BookingStatus.CONFIRMED
    ) {
      throw NotFoundError('Booking is not active');
    }

    if (dayjs(booking.move_in_date).isAfter(currentDate)) {
      throw NotFoundError('Booking should be cancel instead of termination');
    }

    const termination = await this.terminationEntity.findOne({
      where: { booking_id: { [Op.eq]: payload?.booking_id } },
    });

    if (termination) {
      throw BadRequestError('Termination is already requested!');
    }

    const promotions = await this.bookingPromotionEntity.findAll({
      where: { booking_id: { [Op.eq]: payload.booking_id } },
      include: [
        { model: BookingPromotionCustomerBuysModel },
        { model: BookingPromotionCustomerGetsModel },
      ],
    });

    // TODO: inlucde booking public promotion as well and calculate
    const renewals = await this.renewalEntity.findAll({
      where: { booking_id: payload?.booking_id },
      include: [{ model: BookingPromotionModel, as: 'booking_promotion' }],
      order: [['created_at', 'ASC']],
    });

    // If promo was applied then user need to clear up the promotion dues if did not meet commitment months
    let paidDiscount = this.calculatePromotionDues(promotions, renewals);

    // in case of cron job, we're not charging promotion dues to customer
    // since its coming from cron, it would have completed commitments already
    if (args?.is_cron) {
      paidDiscount = 0;
    }

    const lastRenewal =
      renewals.length > 0 ? renewals[renewals.length - 1] : null;

    let excludeNotice = false;
    let unusedDays = 0;
    let unusedDaysAmount = 0;

    if (
      lastRenewal &&
      dayjs(lastRenewal.renewal_end_date).isAfter(dayjs(terminationDate))
    ) {
      excludeNotice = true;
      unusedDays = dayjs(lastRenewal.renewal_end_date).diff(
        dayjs(terminationDate),
        'days',
      );
      unusedDaysAmount = parseFloat(
        ((booking.base_amount / 30) * unusedDays).toFixed(2),
      );

      //
      unusedDaysAmount = Math.max(unusedDaysAmount, 0);
    }

    // Scenario:
    // Booking have move out day AND the user wants to terminate before of that date.
    // Then, customer needs to pay at least 14 days (due to termination policy.)
    // nextDaysToBeCharged: from today to move out date, we'll not count these in remainingDaysAmountBeforeToday
    let nextDaysToBeCharged = requestMoveOutDate.diff(currentDate, 'days') + 1;
    if (nextDaysToBeCharged < this.terminationNoticeDays) {
      nextDaysToBeCharged = this.terminationNoticeDays;
    }

    // Scenario
    // Booking have no move out date and user wants to terminate after the last renewal day
    // We need to charge user a propostional amount
    if (
      lastRenewal &&
      dayjs(lastRenewal.renewal_end_date).isBefore(dayjs(terminationDate))
    ) {
      nextDaysToBeCharged =
        dayjs(terminationDate).diff(
          dayjs(lastRenewal.renewal_end_date),
          'days',
        ) + 1;
    }
    // noticePeriodAmount from today onwards
    let noticePeriodAmount = parseFloat(
      ((booking.base_amount / 30) * nextDaysToBeCharged).toFixed(2),
    );
    if (args?.exclude_notice_dues || excludeNotice) {
      noticePeriodAmount = 0;
    }

    // calculate failed renewals amount and remaining days amount which is not paid yet
    const {
      failedRenewalsAmount,
      remainingDaysAmountBeforeToday,
    } = this.calculateFailedRenewalAmount(currentDate, promotions, renewals);

    const totalAmount = parseFloat(
      (
        noticePeriodAmount +
        paidDiscount +
        failedRenewalsAmount +
        remainingDaysAmountBeforeToday
      ).toFixed(2),
    );

    return {
      requestMoveOutDate,
      terminationDate,
      noticePeriodAmount,
      promoAmount: paidDiscount,
      failedRenewalsAmount,
      remainingDaysAmount: remainingDaysAmountBeforeToday,
      unusedDaysAmount,
      totalAmount,
      currency: booking.currency,
      currencySign: booking.currency_sign,
    };
  }

  /**
   * If the promotion was applied and customer didn't stayed for the committed months,
   * Then we need to charge customer 100% of what was given discount for the promotions
   */
  private calculatePromotionDues(
    promotions: BookingPromotionModel[],
    renewals: RenewalModel[],
  ): number {
    let promotionDiscount = 0;

    const commitmentFailed = this.isCommitmentFailed(promotions, renewals);
    if (commitmentFailed.public || commitmentFailed.voucher) {
      renewals.forEach((renewal) => {
        if (renewal.status === RenewalStatus.PAID) {
          const failedForPublicPromo =
            commitmentFailed.public &&
            renewal.booking_promotion?.format === PromotionFormat.PUBLIC;
          const failedForPrivatePromo =
            commitmentFailed.voucher &&
            renewal.booking_promotion?.format === PromotionFormat.VOUCHER;

          if (failedForPublicPromo || failedForPrivatePromo) {
            promotionDiscount += renewal.discount_amount;
          }
        }
      });
    }

    return parseFloat(promotionDiscount.toFixed(2));
  }

  private isCommitmentFailed(
    promotions: BookingPromotionModel[],
    renewals: RenewalModel[],
  ): { public: boolean; voucher: boolean } {
    const resp = {
      public: false,
      voucher: false,
    };

    promotions.forEach((promotion) => {
      // get no. of renewal months after promotions applied
      let monthsAfterPromoApplied = 0;
      const renewalAfterPromoApplied = renewals.filter((renewal) =>
        dayjs(renewal.renewal_start_date).isSameOrAfter(
          dayjs(promotion.applied_at),
        ),
      );

      if (renewalAfterPromoApplied.length) {
        //
        const firstRenewal = renewalAfterPromoApplied[0];
        const lastRenewal =
          renewalAfterPromoApplied[renewalAfterPromoApplied.length - 1];

        // adding 5 days in last renewal date to calculate renewals monhs
        // just in case customer moved out some days before of commitment
        // so we don't make it too hard rule to complete last few days too to complete the commitment
        const lastRenewalDate = dayjs(lastRenewal.renewal_end_date).add(
          5,
          'days',
        );
        monthsAfterPromoApplied = lastRenewalDate.diff(
          dayjs(firstRenewal.renewal_start_date),
          'months',
        );
      }

      // Check if commitment is failed, like promotion was for 6 months and customer stayed less than that
      if (
        promotion.customer_buys?.[0]?.type === PromotionBuyTypes.MIN_DAYS &&
        monthsAfterPromoApplied < promotion.customer_buys?.[0]?.value / 30
      ) {
        if (promotion.format === PromotionFormat.PUBLIC) {
          resp.public = true;
        } else if (promotion.format === PromotionFormat.VOUCHER) {
          resp.voucher = true;
        }
      }
    });

    return resp;
  }

  /**
   * This would return amount of UNPAID renewals in two parts
   * 1. failedRenewalsAmount - Which is full months' unpaid amount
   * 2. remainingDaysAmount - remaining days amount
   */
  private calculateFailedRenewalAmount(
    currentDate: Dayjs,
    promotions: BookingPromotionModel[],
    renewals: RenewalModel[],
  ): { failedRenewalsAmount: number; remainingDaysAmountBeforeToday: number } {
    let failedRenewalsAmount = 0;

    // calculate remaining days amount which is not paid yet
    let remainingDaysAmountBeforeToday = 0;

    // mean we need to charge(given discount as well) if promotion was given
    const commitmentFailed = this.isCommitmentFailed(promotions, renewals);

    renewals.forEach((renewal) => {
      // renewal.renewal_end_date <= currentDate
      // MEANS we only get FULL LAST MONTHS UNPAID renewals BEFORE TODAY,
      const renewalStartDate = dayjs(renewal.renewal_start_date);
      const renewalEndDate = dayjs(renewal.renewal_end_date);

      if (renewal.status !== RenewalStatus.PAID) {
        if (renewalEndDate.isBefore(currentDate)) {
          failedRenewalsAmount += renewal.total_amount;

          const failedForPublicPromo =
            commitmentFailed.public &&
            renewal.booking_promotion?.format === PromotionFormat.PUBLIC;
          const failedForPrivatePromo =
            commitmentFailed.voucher &&
            renewal.booking_promotion?.format === PromotionFormat.VOUCHER;

          if (failedForPublicPromo || failedForPrivatePromo) {
            failedRenewalsAmount += renewal.discount_amount;
          }
        }

        if (
          renewalStartDate.isBefore(currentDate) &&
          renewalEndDate.isAfter(currentDate)
        ) {
          const remainingDays = currentDate.diff(renewalStartDate, 'days');
          let renewalTotalAmount = renewal.total_amount;

          const failedForPublicPromo =
            commitmentFailed.public &&
            renewal.booking_promotion?.format === PromotionFormat.PUBLIC;
          const failedForPrivatePromo =
            commitmentFailed.voucher &&
            renewal.booking_promotion?.format === PromotionFormat.VOUCHER;

          if (failedForPublicPromo || failedForPrivatePromo) {
            renewalTotalAmount += renewal.discount_amount;
          }

          remainingDaysAmountBeforeToday = parseFloat(
            ((renewalTotalAmount / 30) * remainingDays).toFixed(2),
          );

          if (remainingDaysAmountBeforeToday < 0) {
            remainingDaysAmountBeforeToday = 0;
          }
        }
      }
    });

    return {
      failedRenewalsAmount: parseFloat(failedRenewalsAmount.toFixed(2)),
      remainingDaysAmountBeforeToday: parseFloat(
        remainingDaysAmountBeforeToday.toFixed(2),
      ),
    };
  }
}
