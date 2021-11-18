import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import to from 'await-to-js';
import dayjs from 'dayjs';

import { AppModule } from '../../app.module';
import { BookingSiteAddressModule } from '../../bookings/booking-site-addresses/booking-site-address.module';
import { BookingSiteAddressService } from '../../bookings/booking-site-addresses/booking-site-address.service';
import { BookingModel } from '../../bookings/booking.model';
import { BookingModule } from '../../bookings/booking.module';
import { BookingService } from '../../bookings/booking.service';
import { TerminationStatus } from '../../graphql.schema';
import { adminEmailTemplates } from '../../shared/mailer/email-templates';
import { NotificationService } from '../../shared/notifications/notification.service';
import { getCountryBaseCSEmail } from '../../shared/utils/country-config';
import { TerminationModule } from '../../terminations/termination.module';
import { TerminationService } from '../../terminations/termination.service';

const sendPaymentFailedEmail = async (
  adminEmail: string,
  booking: BookingModel,
) => {
  const notificationService = new NotificationService();
  const logger = new Logger();

  try {
    // send email notification to admin
    await notificationService.sendEmail(adminEmail, {
      data: {
        booking_id: booking.short_id,
        move_out_date: dayjs(booking.move_out_date).format('DD-MM-YYYY'),
        termination_date: dayjs(booking.move_out_date).format('DD-MM-YYYY'),
      },
      template_id: adminEmailTemplates.ADMIN_TERMINATION_PAYMENT_FAILED,
    });

    logger.log(
      `Successfully sent termination booking email to the admin email: ${adminEmail}, booking id: ${booking?.id}`,
    );
  } catch (e) {
    logger.log(
      `There was an error sending email to the provider. Booking id ${booking?.id}, email: ${adminEmail}`,
    );
    logger.log(e);
  }
};

const terminateBookingCron = async () => {
  const app = await NestFactory.createApplicationContext(AppModule);

  const bookingService = app
    .select(BookingModule)
    .get(BookingService, { strict: true });

  const bookingSiteAddressService = app
    .select(BookingSiteAddressModule)
    .get(BookingSiteAddressService, { strict: true });

  const terminationService = app
    .select(TerminationModule)
    .get(TerminationService, { strict: true });

  const logger = new Logger();
  const currentDate = new Date();
  currentDate.setMinutes(currentDate.getMinutes() - 15);

  const dateAfter14Days = dayjs().add(14, 'days');

  /**
   *
   * On the day of terminate, mark status as TERMINATED
   */
  const updatedRecs = await terminationService.updateTerminationStatus(
    TerminationStatus.TERMINATED,
    {
      status: { _eq: TerminationStatus.SCHEDULED },
      termination_date: { _lte: currentDate },
    },
  );

  logger.log(`Successfully TERMINATED ${updatedRecs?.modified} terminations.`);

  /**
   *
   * Create termination entry for bookings which have move out date after 14 days
   */
  const [error, bookings] = await to(
    bookingService.getActiveBookingsToTerminate(dateAfter14Days.toDate()),
  );

  if (error) {
    logger.error('Something went wrong while fetching bookings!');
    logger.error(error);
    return;
  }

  if (bookings.length === 0) {
    logger.log('No active bookings found');
    return;
  }

  logger.log(`Total Active Bookings to terminate: ${bookings?.length}`);

  const promises = [];
  for (const booking of bookings) {
    logger.log(`Found Booking: ${JSON.stringify(booking)}`);
    logger.log(
      `Request for termination for Booking: ${booking?.id} - ${booking?.short_id}`,
    );

    const bookingSiteAddress = await bookingSiteAddressService.getById(
      booking.site_address_id,
    );

    const adminEmail = getCountryBaseCSEmail(
      bookingSiteAddress?.country?.name_en,
    );

    const [terminationError, termination] = await to(
      terminationService.requestTermination(
        {
          move_out_date: booking.move_out_date,
          booking_id: booking.id,
        },
        { exclude_notice_dues: true, use_move_out_date: true, is_cron: true },
      ),
    );

    if (terminationError) {
      logger.error(
        `Something went wrong while requesting termination for ${booking.id}!`,
      );
      logger.error(terminationError);
      continue;
    }

    if (termination.total_amount > 0) {
      const [payError] = await to(
        terminationService.payTerminationDues({
          termination_id: termination.id,
        }),
      );

      if (payError) {
        logger.error(
          `Something went wrong while termination payment for ${booking.id}!`,
        );
        logger.error(terminationError);

        promises.push(await sendPaymentFailedEmail(adminEmail, booking));
        continue;
      }
    }
  }

  await Promise.all(promises);

  await app.close();
};

void terminateBookingCron();
