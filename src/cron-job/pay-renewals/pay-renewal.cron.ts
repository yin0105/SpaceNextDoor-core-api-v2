import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import to from 'await-to-js';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

import { AppModule } from '../../app.module';
import { AppliedTaxModule } from '../../applied-taxes/applied-tax.module';
import { AppliedTaxService } from '../../applied-taxes/applied-tax.service';
import { BookingModel } from '../../bookings/booking.model';
import { BookingModule } from '../../bookings/booking.module';
import { BookingService } from '../../bookings/booking.service';
import { BookingPromotionModule } from '../../bookings/promotions/promotion/promotion.module';
import { BookingPromotionService } from '../../bookings/promotions/promotion/promotion.service';
import { RenewalModule } from '../../bookings/renewals/renewal.module';
import { RenewalService } from '../../bookings/renewals/renewal.service';
import { ITransactionEntity } from '../../bookings/transactions/interfaces/transaction.interface';
import { TransactionModule } from '../../bookings/transactions/transaction.module';
import { TransactionService } from '../../bookings/transactions/transaction.service';
import {
  BookingStatus,
  RenewalStatus,
  TransactionType,
} from '../../graphql.schema';
import { IDCounterModule } from '../../ids_counter/ids_counter.module';
import { IDCounterService } from '../../ids_counter/ids_counter.service';
import { ICreateRedeemPayload } from '../../promotions/redeem/interfaces/redeem.interface';
import { PromotionRedeemModule } from '../../promotions/redeem/redeem.module';
import { PromotionRedeemService } from '../../promotions/redeem/redeem.service';
import {
  getEmailTemplateT,
  SMSNames,
  smsTemplateT,
  TemplateNames,
} from '../../shared/mailer/email-templates';
import { NotificationService } from '../../shared/notifications/notification.service';
import { getClientBaseUrl } from '../../shared/utils/country-config';
import { StripeModule } from '../../stripe/stripe.module';
import { StripeService } from '../../stripe/stripe.service';
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

/**
 * Send Email and/or SMS Notifications to customer on failed renewals
 */
const sendPaymentFailedNotifications = async (
  booking: BookingModel,
  args: {
    renewal_start_date: Date;
    renewal_end_date: Date;
    last_digits: string;
  },
) => {
  const notificationService = new NotificationService();
  const logger = new Logger();

  const customerPhone = booking?.customer?.phone_number || null;

  if (customerPhone) {
    const failedNotificationTemplate = smsTemplateT(
      SMSNames.RENEWAL_FAIL,
      booking?.customer?.preferred_language,
    )({ shortId: booking?.short_id });
    try {
      await notificationService.sendSMS(
        customerPhone,
        failedNotificationTemplate,
      );
      logger.log(
        `Successfully sent failed renewal payment notification to the customer 
          phone number: ${customerPhone}, booking id: ${booking?.short_id}`,
      );
    } catch (error) {
      logger.log(
        `There was an error sending SMS to the customer. Booking id ${booking?.short_id}, phone number: ${customerPhone}`,
      );
      logger.log(error);
    }
  }

  try {
    await notificationService.sendEmail(booking?.customer?.email, {
      data: {
        customer_name: booking.customer_name || '',
        booking_id: booking.short_id,
        card_last_digits: args.last_digits,
        renewal_start: dayjs(args.renewal_start_date).format('DD-MM-YYYY'),
        renewal_end: dayjs(args.renewal_end_date).format('DD-MM-YYYY'),
      },
      template_id: getEmailTemplateT(
        TemplateNames.FAILED_RENEWAL,
        booking.customer?.preferred_language,
      ),
      country: booking.site_address?.country?.name_en,
      sendToCS: true,
    });

    logger.log(
      `Successfully sent email to the customer for Failed Renewal. Booking id: ${booking?.short_id}, email: ${booking.customer_email}`,
    );
  } catch (e) {
    logger.log(
      `There was an error sending email to the customer for Failed Renewal. Booking id: ${booking?.short_id}, email: ${booking.customer_email}`,
    );
    logger.log(e);
  }
};

// eslint-disable-next-line complexity
const payRenewalCron = async () => {
  const app = await NestFactory.createApplicationContext(AppModule);

  const notificationService = new NotificationService();

  const renewalService = app
    .select(RenewalModule)
    .get(RenewalService, { strict: true });

  const transactionService = app
    .select(TransactionModule)
    .get(TransactionService, { strict: true });

  const stripeService = app
    .select(StripeModule)
    .get(StripeService, { strict: true });

  const bookingService = app
    .select(BookingModule)
    .get(BookingService, { strict: true });

  const bookingPromotionService = app
    .select(BookingPromotionModule)
    .get(BookingPromotionService, { strict: true });

  const promotionRedeemService = app
    .select(PromotionRedeemModule)
    .get(PromotionRedeemService, { strict: true });

  const idCounterService = app
    .select(IDCounterModule)
    .get(IDCounterService, { strict: true });

  const appliedTaxService = app
    .select(AppliedTaxModule)
    .get(AppliedTaxService, { strict: true });

  const logger = new Logger();
  const currentDate = dayjs();

  // get all active bookings
  const [getBookingsErr, bookings] = await to(
    bookingService.getAllBookings({ status: { _eq: BookingStatus.ACTIVE } }),
  );

  if (getBookingsErr) {
    logger.error('Something went wrong while fetching bookings!');
    logger.error(getBookingsErr);
    return;
  }

  if (bookings.length === 0) {
    logger.log('No active bookings found');
    return;
  }

  logger.log(`Total Active Bookings Found: ${bookings?.length}`);

  for (const booking of bookings) {
    logger.log(`Found Booking: ${JSON.stringify(booking)}`);
    logger.log(
      `Found Booking Renewals for booking # ${
        booking?.short_id
      }: ${JSON.stringify(booking?.renewals)}`,
    );

    // if termination is requested, all other dues would be paid in termination
    if (booking?.is_termination_requested) {
      logger.log(
        `Termination was requested, SKIPPING...: ${booking?.short_id}`,
      );
      continue;
    }

    let charge;
    const currency = booking?.currency.toLowerCase();
    const bookingId = booking?.id;
    const insurancePricePerDay = booking?.insurance?.price_per_day || 0;
    const moveOutDate = booking?.move_out_date || null;
    const stripeCustomerId = booking?.customer?.stripe_customer_id || null;
    const baseAmount = booking?.base_amount;

    // this loop will try to charge all FAILED renewals
    for (const renewal of booking.renewals) {
      let failedRenewalCharge;
      const renewalTotalAmount = renewal?.total_amount;

      if (
        renewal.status !== RenewalStatus.FAILED &&
        renewal.status !== RenewalStatus.UN_PAID
      ) {
        continue;
      }

      /**
       * FAILED renewal need to be charged again after 72 hours not after 24 hours
       */
      if (renewal.last_attempt_date) {
        const diffInDays = currentDate.diff(
          renewal.last_attempt_date,
          'days',
          true,
        );

        if (diffInDays <= 2) {
          logger.log(
            `SKIPPING RENEWAL:: FAILED renewal was last charged on: ${renewal.last_attempt_date}, diff in days: ${diffInDays}`,
          );
          continue;
        }
      }

      const failedRenewalTransaction = await bookingService
        .getSequelizeInstance()
        .transaction();

      let cardLastDigits = '';
      try {
        const transactionShortId = await idCounterService.generateTransactionId();

        const invoiceId = await idCounterService.generateInvoiceId();

        const chargeAmount = stripeService.calculateAmountInCurrency(
          renewalTotalAmount,
          currency,
        );

        const card = await stripeService.retrieveCard(stripeCustomerId);
        cardLastDigits = card?.last4;

        failedRenewalCharge = await stripeService.charge(
          chargeAmount,
          currency,
          stripeCustomerId,
          `Payment for renewal of booking # ${booking?.short_id}`,
        );

        logger.log(
          `Successfully created a charge. charge amount: ${chargeAmount}, currency: ${currency}`,
        );

        const transactionPayload: Partial<ITransactionEntity> = {
          stripe_charge_id: failedRenewalCharge?.id,
          stripe_customer_id: stripeCustomerId,
          card_brand_name: card?.brand,
          card_last_digits: card?.last4,
          amount: renewalTotalAmount,
          currency,
          booking_id: bookingId,
          invoice_id: invoiceId,
          short_id: transactionShortId,
          type: TransactionType.RENEWAL,
          user_id: booking?.customer_id,
          renewal_id: renewal?.id,
        };

        const transaction = await transactionService.create(
          transactionPayload,
          {
            t: failedRenewalTransaction,
          },
        );

        await renewalService.update(
          renewal?.id,
          {
            status: RenewalStatus.PAID,
            transaction_id: transaction?.id,
            renewal_paid_date: currentDate.toDate(),
            last_attempt_date: currentDate.toDate(),
          },
          { t: failedRenewalTransaction },
        );

        // create redeem entry if promotion was applied
        if (renewal?.promotion_id) {
          const redeemPayload: ICreateRedeemPayload = {
            booking_id: bookingId,
            customer_id: booking?.customer_id,
            promotion_id: renewal?.promotion_id,
            booking_promotion_id: renewal?.booking_promotion_id,
            renewal_id: renewal?.id,
          };

          await promotionRedeemService.create(redeemPayload, {
            t: failedRenewalTransaction,
          });
        }

        await failedRenewalTransaction.commit();

        // send email to customer
        await notificationService.sendEmail(booking.customer_email, {
          data: {
            booking_id: booking.short_id,
            end_date: dayjs(renewal.renewal_end_date).format('DD-MM-YYYY'),
            name: booking.customer_name || '',
            transaction_id: transaction?.id,
            space_size: `${booking?.space_size}${booking?.space_size_unit}`,
            start_date: dayjs(renewal.renewal_start_date).format('DD-MM-YYYY'),
            total_price: `${renewal?.total_amount}${booking?.currency_sign}`,
            payment_method: 'CARD',
            web_domain_url: getClientBaseUrl(
              booking?.site_address?.country?.name_en,
            ),
          },
          template_id: getEmailTemplateT(
            TemplateNames.NEXT_RENEWAL,
            booking.customer?.preferred_language,
          ),
        });
      } catch (err) {
        if (failedRenewalCharge) {
          logger.log(
            `Refunding a charge: ${JSON.stringify(failedRenewalCharge)}`,
          );

          await stripeService.refund(failedRenewalCharge?.id);
        }

        await sendPaymentFailedNotifications(booking, {
          renewal_start_date: renewal.renewal_start_date,
          renewal_end_date: renewal.renewal_end_date,
          last_digits: cardLastDigits,
        });

        logger.error(`Pay Renewal Error: ${booking?.short_id}`, err?.stack);
        await failedRenewalTransaction.rollback();

        //
        await renewalService.update(renewal?.id, {
          last_attempt_date: currentDate.toDate(),
        });

        continue;
      }
    }

    /**
     * Create new renewal and try to charge it
     * for the renewal month of (booking.renewals.length + 1)
     */
    const {
      renewalStartDate,
      renewalType,
      nextRenewalDateOfLastRenewal,
    } = bookingService.getRenewalInfo(booking);

    logger.log(
      `Found Customer for booking # ${booking?.short_id}: ${JSON.stringify(
        booking?.customer,
      )}`,
    );

    /* if
        next_renewal_date is equal or before to the current date if yes then we create a charge,
        renewal and transaction
        We Added "OrAfter" in case some renewals were not created because of some issue in cron or unhandled error
        and date was passed, to tackle that added this check.
      */
    if (!currentDate.isSameOrAfter(nextRenewalDateOfLastRenewal, 'day')) {
      logger.log(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        // eslint-disable-next-line max-len
        `Current Date: ${currentDate?.toString()} doesn't match with the next renewal date of the last renewal: ${nextRenewalDateOfLastRenewal} for booking # ${
          booking?.short_id
        }`,
      );

      continue;
    }

    if (currentDate.isSameOrAfter(moveOutDate, 'day')) {
      continue;
    }

    if (
      !currentDate.isSame(nextRenewalDateOfLastRenewal, 'day') &&
      currentDate.isAfter(nextRenewalDateOfLastRenewal, 'day')
    ) {
      logger.log(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `Current Date: ${currentDate?.toString()} does not match, but not create renewal, trying to create new renewal now for booking # ${
          booking?.short_id
        }`,
      );
    } else {
      logger.log(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        // eslint-disable-next-line max-len
        `Current Date: ${currentDate?.toString()} matches with the next renewal date of the last renewal: ${nextRenewalDateOfLastRenewal} for booking # ${
          booking?.short_id
        }`,
      );
    }

    // apply promotions
    const promotionInfo = await bookingPromotionService.getBookingPromotionAmount(
      baseAmount,
      booking,
      null,
      booking.renewals,
    );

    const renewalPayload = renewalService.getRenewalPayload(
      insurancePricePerDay,
      0,
      renewalStartDate,
      nextRenewalDateOfLastRenewal,
      bookingId,
      baseAmount,
      promotionInfo.discounted_amount,
      RenewalStatus.PAID,
      renewalType,
      null,
      moveOutDate,
    );
    renewalPayload.insurance_id = booking.insurance_id;

    if (promotionInfo?.promotion?.id) {
      renewalPayload.booking_promotion_id = promotionInfo?.promotion?.id;
      renewalPayload.promotion_id = promotionInfo?.promotion?.promotion_id;
    }

    if (promotionInfo?.public_promotion?.id) {
      renewalPayload.booking_public_promotion_id =
        promotionInfo?.public_promotion?.id;
      renewalPayload.public_promotion_id =
        promotionInfo?.public_promotion?.promotion_id;
    }

    // calculate tax
    const taxes = await appliedTaxService.calculateTax({
      site_id: booking.site_id,
      space_price:
        promotionInfo.discounted_amount > 0
          ? renewalPayload.sub_total_amount - promotionInfo.discounted_amount
          : renewalPayload.sub_total_amount,
      insurance_id: booking?.insurance_id,
      insurance_price: booking?.insurance_amount,
    });

    renewalPayload.total_tax_amount = taxes.totalTax;
    renewalPayload.total_amount = parseFloat(
      (renewalPayload.total_amount + taxes.totalTax).toFixed(2),
    );
    const amount = renewalPayload.total_amount;

    // update projected next renewal amount if any
    if (renewalPayload.next_renewal_sub_total) {
      const {
        total,
        discount,
      } = await bookingService.getRenewalProjectedAmount(
        booking,
        renewalPayload.next_renewal_sub_total,
        booking.renewals.length + 2,
      );

      renewalPayload.next_renewal_total = total;
      renewalPayload.discount_amount = discount;
    }

    const t = await bookingService.getSequelizeInstance().transaction();

    //
    let lastDigits = '';
    try {
      const transactionShortId = await idCounterService.generateTransactionId();

      const invoiceId = await idCounterService.generateInvoiceId();

      const chargeAmount = stripeService.calculateAmountInCurrency(
        amount,
        currency,
      );

      const card = await stripeService.retrieveCard(stripeCustomerId);
      lastDigits = card?.last4;

      charge = await stripeService.charge(
        chargeAmount,
        currency,
        stripeCustomerId,
        `Payment for renewal of booking # ${booking?.short_id}`,
      );

      logger.log(
        `Successfully created a charge. charge amount: ${chargeAmount}, currency: ${currency}`,
      );

      logger.log(`${JSON.stringify(charge)}`);

      const transactionPayload: Partial<ITransactionEntity> = {
        stripe_charge_id: charge?.id,
        stripe_customer_id: stripeCustomerId,
        card_brand_name: card?.brand,
        card_last_digits: card?.last4,
        amount,
        currency,
        booking_id: bookingId,
        short_id: transactionShortId,
        invoice_id: invoiceId,
        type: TransactionType.RENEWAL,
        user_id: booking?.customer_id,
      };

      const transaction = await transactionService.create(transactionPayload, {
        t,
      });

      logger.log(
        `Successfully created a transaction. amount: ${amount}, booking id: ${bookingId}, currency: ${currency}`,
      );

      renewalPayload.transaction_id = transaction?.id;
      renewalPayload.renewal_paid_date = currentDate.toDate();

      // TODO: when do we create it, before 1 month of one day? like we need to create redeem entry here
      const createdRenewal = await renewalService.create(renewalPayload, { t });

      // update transaction with renewal id
      await transactionService.update(
        { renewal_id: createdRenewal.id },
        { id: transaction.id, t },
      );

      await appliedTaxService.createAppliedTaxes(taxes.taxes, booking.id, {
        userId: booking?.customer_id,
        renewalId: createdRenewal?.id,
        insuranceId: renewalPayload.insurance_id,
        t,
      });

      // create redeem entry if promotion was applied
      if (promotionInfo?.promotion?.promotion_id) {
        const redeemPayload: ICreateRedeemPayload = {
          booking_id: bookingId,
          customer_id: booking?.customer_id,
          promotion_id: promotionInfo?.promotion?.promotion_id,
          booking_promotion_id: promotionInfo?.promotion?.id,
          renewal_id: createdRenewal?.id,
        };

        await promotionRedeemService.create(redeemPayload, { t });
      }

      logger.log(
        `Successfully created a renewal. ${JSON.stringify(renewalPayload)}`,
      );

      await t.commit();

      // send email to customer
      await notificationService.sendEmail(booking.customer_email, {
        data: {
          booking_id: booking.short_id,
          end_date: dayjs(renewalPayload.renewal_end_date).format('DD-MM-YYYY'),
          name: booking.customer_name || '',
          transaction_id: transaction?.id,
          space_size: `${booking?.space_size}${booking?.space_size_unit}`,
          start_date: dayjs(renewalPayload.renewal_start_date).format(
            'DD-MM-YYYY',
          ),
          total_price: `${renewalPayload?.total_amount}${booking?.currency_sign}`,
          payment_method: 'CARD',
          web_domain_url: getClientBaseUrl(
            booking?.site_address?.country?.name_en,
          ),
        },
        template_id: getEmailTemplateT(
          TemplateNames.NEXT_RENEWAL,
          booking.customer?.preferred_language,
        ),
      });
    } catch (err) {
      const transaction = await bookingService
        .getSequelizeInstance()
        .transaction();
      /* if charge failed from stripe simply create a new renewal with failed status
       */
      logger.log('Something went wrong while creating a charge.');

      renewalPayload.status = RenewalStatus.FAILED;
      renewalPayload.transaction_id = null;
      renewalPayload.renewal_paid_date = null;
      renewalPayload.last_attempt_date = currentDate.toDate();

      try {
        await renewalService.create(renewalPayload, {
          t: transaction,
        });

        await transaction.commit();

        logger.log(
          `Successfully created a renewal: ${JSON.stringify(renewalPayload)}`,
        );
      } catch (e) {
        await transaction.rollback();
      }

      if (charge) {
        logger.log(`Refunding a charge:: ${JSON.stringify(charge)}`);

        await stripeService.refund(charge?.id);
      }

      await sendPaymentFailedNotifications(booking, {
        renewal_start_date: renewalPayload.renewal_start_date,
        renewal_end_date: renewalPayload.renewal_end_date,
        last_digits: lastDigits,
      });

      logger.error(`Pay Renewal Error:: ${booking?.short_id}`, err?.stack);
      await t.rollback();
      continue;
    }
  }

  await app.close();
};

void payRenewalCron();
