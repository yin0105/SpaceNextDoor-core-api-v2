import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import dayjs from 'dayjs';

import { AppModule } from '../../app.module';
import { UserModule } from '../../auth/users/user.module';
import { UserService } from '../../auth/users/user.service';
import { BookingSiteAddressModule } from '../../bookings/booking-site-addresses/booking-site-address.module';
import { BookingSiteAddressService } from '../../bookings/booking-site-addresses/booking-site-address.service';
import { BookingModule } from '../../bookings/booking.module';
import { BookingService } from '../../bookings/booking.service';
import { BookingStatus, OrderStatus } from '../../graphql.schema';
import { OrderModule } from '../../orders/order.module';
import { OrderService } from '../../orders/order.service';
import {
  getEmailTemplateT,
  SMSNames,
  smsTemplateT,
  TemplateNames,
} from '../../shared/mailer/email-templates';
import { NotificationService } from '../../shared/notifications/notification.service';
import { getClientBaseUrl } from '../../shared/utils/country-config';

// eslint-disable-next-line complexity
const cancelBookingCron = async () => {
  const app = await NestFactory.createApplicationContext(AppModule);

  const notificationService = new NotificationService();

  const bookingService = app
    .select(BookingModule)
    .get(BookingService, { strict: true });

  const bookingSiteAddressService = app
    .select(BookingSiteAddressModule)
    .get(BookingSiteAddressService, { strict: true });

  const orderService = app
    .select(OrderModule)
    .get(OrderService, { strict: true });

  const userService = app.select(UserModule).get(UserService, { strict: true });

  const logger = new Logger();
  const currentDate = new Date();
  currentDate.setMinutes(currentDate.getMinutes() - 15);

  const updateBooking = await bookingService.updateBookingsStatus(
    BookingStatus.CANCELLED,
    {
      status: { _eq: BookingStatus.RESERVED },
      created_at: { _lte: currentDate },
    },
  );

  const updateOrders = await orderService.updateOrderStatus(
    OrderStatus.CANCELLED,
    {
      status: { _eq: OrderStatus.PENDING },
      created_at: { _lte: currentDate },
    },
  );

  logger.log(`Successfully cancelled ${updateBooking?.modified} bookings.`);

  logger.log(`Successfully cancelled ${updateOrders?.modified} orders.`);

  for (const booking of updateBooking?.bookings) {
    const customer = await userService.findOne(booking.customer_id);
    const bookingSiteAddress = await bookingSiteAddressService.getById(
      booking.site_address_id,
    );
    const customerPhoneNumber = booking?.customer_phone_number || null;
    const cancelNotification = smsTemplateT(
      SMSNames.CANCEL_BOOKING,
      customer?.preferred_language,
    )({ shortId: booking?.short_id });

    const promises = [];

    if (customerPhoneNumber) {
      promises.push(
        (async () => {
          try {
            await notificationService.sendSMS(
              customerPhoneNumber,
              cancelNotification,
            );

            logger.log(
              `Successfully sent cancelled booking notification to the customer 
                phone number: ${customerPhoneNumber}, booking id: ${booking?.id}`,
            );
          } catch (e) {
            logger.log(
              `There was an error sending SMS to the customer. Booking id ${booking?.id}, phone number: ${customerPhoneNumber}`,
            );
            logger.log(e);
          }
        })(),
      );
    }

    // email to customer
    promises.push(
      (async () => {
        try {
          await notificationService.sendEmail(booking?.customer_email, {
            data: {
              booking_id: booking?.short_id,
              first_name: booking?.customer_name || '',
              move_in_date: dayjs(booking.move_in_date).format('DD-MM-YYYY'),
              total_amount: `${booking?.total_amount}${booking?.currency_sign}`,
              web_domain_url: getClientBaseUrl(
                bookingSiteAddress?.country?.name_en,
              ),
            },
            template_id: getEmailTemplateT(
              TemplateNames.BOOKING_CANCELLED,
              customer?.preferred_language,
            ),
            country: bookingSiteAddress?.country?.name_en,
            sendToCS: true,
          });

          logger.log(
            `Successfully sent cancelled booking email to the customer 
              customer email: ${booking?.customer_email}, booking id: ${booking?.id}`,
          );
        } catch (e) {
          logger.log(
            `There was an error sending email to the customer. Booking id ${booking?.id}, email: ${booking?.customer_email}`,
          );
          logger.log(e);
        }
      })(),
    );

    // email to host
    const provider = await userService.findOne(booking.provider_id);
    promises.push(
      (async () => {
        try {
          await notificationService.sendEmail(provider?.email, {
            data: {
              booking_id: booking?.short_id,
              first_name: provider?.first_name || provider?.email || '',
            },
            template_id: getEmailTemplateT(
              TemplateNames.HOST_BOOKING_CANCELLATION,
              provider?.preferred_language,
            ),
          });

          logger.log(
            `Successfully sent cancelled booking email to the provider 
              provider email: ${provider?.email}, booking id: ${booking?.id}`,
          );
        } catch (e) {
          logger.log(
            `There was an error sending email to the provider. Booking id ${booking?.id}, email: ${provider?.email}`,
          );
          logger.log(e);
        }
      })(),
    );

    await Promise.all(promises);
  }

  for (const order of updateOrders?.orders) {
    const customer = await userService.findOne(order?.customer_id);
    const customerPhoneNumber = customer?.phone_number || null;
    const cancelNotification = smsTemplateT(
      SMSNames.CANCEL_BOOKING_ORDER,
      customer?.preferred_language,
    )({ orderId: order?.id });
    const promises = [];

    if (customerPhoneNumber) {
      promises.push(
        (async () => {
          try {
            await notificationService.sendSMS(
              customerPhoneNumber,
              cancelNotification,
            );

            logger.log(
              `Successfully sent cancelled order notification to the customer 
              phone number: ${customerPhoneNumber}, order id: ${order?.id}`,
            );
          } catch (e) {
            logger.log(
              `There was an error sending SMS to the customer. order id ${order?.id}, phone number: ${customerPhoneNumber}`,
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

void cancelBookingCron();
