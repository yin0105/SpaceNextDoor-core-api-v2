import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from '../../app.module';
import { UserModule } from '../../auth/users/user.module';
import { UserService } from '../../auth/users/user.service';
import { BookingModule } from '../../bookings/booking.module';
import { BookingService } from '../../bookings/booking.service';
import { BookingStatus } from '../../graphql.schema';
import { ReviewModule } from '../../reviews/review.module';
import { ReviewService } from '../../reviews/review.service';
import { SMSNames, smsTemplateT } from '../../shared/mailer/email-templates';
import { NotificationService } from '../../shared/notifications/notification.service';

// eslint-disable-next-line complexity
const activeBookingCron = async () => {
  const app = await NestFactory.createApplicationContext(AppModule);

  const notificationService = new NotificationService();

  const bookingService = app
    .select(BookingModule)
    .get(BookingService, { strict: true });

  const reviewService = app
    .select(ReviewModule)
    .get(ReviewService, { strict: true });

  const userService = app.select(UserModule).get(UserService, { strict: true });

  const logger = new Logger();

  let movedInBookingIds: number[] = [];
  try {
    const updateBookingToActive = await bookingService.updateBookingsStatus(
      BookingStatus.ACTIVE,
      {
        status: { _eq: BookingStatus.CONFIRMED },
        move_in_date: { _lte: new Date() },
      },
    );
    movedInBookingIds = updateBookingToActive?.bookings.map(
      (i): number => i.id,
    );
    logger.log(
      `Successfully active ${updateBookingToActive?.modified} bookings.`,
    );
  } catch (err) {
    logger.error('Active Btinooking Error:', err?.stack);
  }

  /**
   * Send booking (order) to yotpot after move in, yotpo will trigger review request after n days
   *
   */
  logger.log(
    `Start sending review request for ${movedInBookingIds?.length} bookings.`,
  );

  if (movedInBookingIds.length > 0) {
    try {
      await reviewService.sendRequestReviewOrders(movedInBookingIds);
      logger.log(
        `${movedInBookingIds?.length} bookings has been sent request review.`,
      );
    } catch (err) {
      logger.error('sending Booking to yotpo Error:', err?.stack);
    }
  }

  const updateBookingToCompleted = await bookingService.updateBookingsStatus(
    BookingStatus.COMPLETED,
    {
      status: { _eq: BookingStatus.ACTIVE },
      move_out_date: { _lte: new Date() },
    },
  );

  logger.log(
    `Successfully completed ${updateBookingToCompleted?.modified} bookings.`,
  );

  for (const booking of updateBookingToCompleted?.bookings) {
    const customerPhoneNumber = booking?.customer_phone_number || null;
    const customer = await userService.findOne(booking.customer_id);
    const completedNotification = smsTemplateT(
      SMSNames.COMPLETE_BOOKING,
      customer?.preferred_language,
    )({
      shortId: booking?.short_id,
    });

    const promises = [];

    if (customerPhoneNumber) {
      promises.push(
        (async () => {
          try {
            await notificationService.sendSMS(
              customerPhoneNumber,
              completedNotification,
            );

            logger.log(
              `Successfully sent completed booking notification to the customer 
                phone number: ${customerPhoneNumber}, booking id: ${booking?.short_id}`,
            );
          } catch (e) {
            logger.log(
              `There was an error sending SMS to the customer. Booking id ${booking?.short_id}, phone number: ${customerPhoneNumber}`,
            );
            logger.log(e);
          }
        })(),
      );
    }

    await Promise.all(promises);
  }

  await app.close();
};

void activeBookingCron();
