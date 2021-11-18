import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import to from 'await-to-js';
import dayjs from 'dayjs';

import { AppModule } from '../../app.module';
import { BookingModule } from '../../bookings/booking.module';
import { BookingService } from '../../bookings/booking.service';
import { RefundType } from '../../graphql.schema';
import { RefundModule } from '../../refunds/refund.module';
import { RefundService } from '../../refunds/refund.service';

const refundBookingCron = async () => {
  const app = await NestFactory.createApplicationContext(AppModule);

  const refundService = app
    .select(RefundModule)
    .get(RefundService, { strict: true });

  const bookingService = app
    .select(BookingModule)
    .get(BookingService, { strict: true });

  const logger = new Logger();
  const currentDate = new Date();
  currentDate.setMinutes(currentDate.getMinutes() - 15);

  // TODO: we need to make bellow 14 to be set up in env.
  const dateBeforeNDays = dayjs().subtract(14, 'days');

  /**
   *
   * We need to update the bookings table first, if there any new refunds booking, update booking table.
   */
  const [getUnUpdatedRefundBookingsError, unUpdatedRefundBookings] = await to(
    bookingService.getUnUpdatedRefundBookings(),
  );

  if (getUnUpdatedRefundBookingsError) {
    logger.error('Something went wrong while fetching refunded bookings!');
    logger.error(getUnUpdatedRefundBookingsError);
  }

  logger.log(
    `Total refunded Bookings to update: ${unUpdatedRefundBookings?.length}`,
  );

  /**
   * Update all bookings that have already refunded
   */
  const updateBookings = [];
  for (const booking of unUpdatedRefundBookings) {
    logger.log(`Found Booking: ${JSON.stringify(booking)}`);
    updateBookings.push(
      booking.update({
        deposit_refunded_date: booking?.refund?.refunded_date,
        is_deposit_refunded: true,
      }),
    );
  }

  const [updateBookingErrors, updatedBookings] = await to(
    Promise.all(updateBookings),
  );

  if (updateBookingErrors) {
    logger.error('Something went wrong while update refunded bookings!');
    logger.error(updateBookingErrors);
  }
  logger.log(`Total updated bookings: ${updatedBookings?.length}`);

  /**
   * Now we need to get all terminated booking, which are collected in table terminations and not refunded
   */
  logger.log(`Before this day : ${dateBeforeNDays.toDate()}`);
  const [error, bookings] = await to(
    bookingService.getTerminatedBookingsForRefund(dateBeforeNDays.toDate()),
  );

  if (error) {
    logger.error('Something went wrong while fetching terminations!');
    logger.error(error.stack);
    return;
  }

  if (bookings.length === 0) {
    logger.log('No terminations entry found');
    return;
  }

  logger.log(`Total terminated bookings to refund: ${bookings?.length}`);

  /**
   * Start refund process
   */
  for (const bookingToRefund of bookings) {
    logger.log(
      `Processing refund for bookingId: ${JSON.stringify(
        bookingToRefund.short_id,
      )}`,
    );
    const {
      currency,
      depositedAmount,
      stripeChargeId,
      unusedDaysOption,
    } = BookingService.getRefundPayloadFromBooking(bookingToRefund);

    const stripeCustomerId =
      bookingToRefund?.customer?.stripe_customer_id || null;

    const refundJob = [
      refundService.refund(
        {
          currency,
          penaltyPercent: 0,
          type: RefundType.REFUND_DEPOSIT,
          amount: depositedAmount,
          bookingId: bookingToRefund.id,
          chargeId: stripeChargeId,
        },
        {
          stripe_customer_id: stripeCustomerId,
          user_id: bookingToRefund?.customer_id,
        },
      ),
    ];

    if (unusedDaysOption && unusedDaysOption.amount >= 1) {
      logger.log(
        `Processing refund unused days amount for bookingId: ${bookingToRefund.id}`,
      );
      refundJob.push(
        refundService.refund(
          {
            currency,
            penaltyPercent: 0,
            type: RefundType.REFUND_UNUSED_DAYS,
            amount: unusedDaysOption.amount,
            bookingId: bookingToRefund.id,
            chargeId: unusedDaysOption.chargeId,
          },
          {
            stripe_customer_id: stripeCustomerId,
            user_id: bookingToRefund?.customer_id,
          },
        ),
      );
    }

    const [refundErrors, refundIds] = await to(Promise.all(refundJob));

    if (refundErrors) {
      logger.error(
        `Error occurred while processing refund for booking: ${bookingToRefund.short_id}`,
      );

      if (!refundIds?.[0]) {
        logger.error(
          `Unable to refund deposit for booking: ${bookingToRefund.short_id}`,
        );
      }
      if (!refundIds?.[1]) {
        logger.error(
          `Unable to refund unused days amount for booking: ${bookingToRefund.short_id}`,
        );
      }

      logger.error('Refund error', refundErrors?.stack);

      continue;
    }
  }

  await app.close();
};

void refundBookingCron();
