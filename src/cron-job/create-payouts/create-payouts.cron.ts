import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from '../../app.module';
import { BookingModule } from '../../bookings/booking.module';
import { BookingService } from '../../bookings/booking.service';
import { RenewalModule } from '../../bookings/renewals/renewal.module';
import { RenewalService } from '../../bookings/renewals/renewal.service';
import appConfig from '../../config/app.config';
import { PayoutStatus } from '../../graphql.schema';
import { IPayoutEntity } from '../../payouts/interfaces/payout.interface';
import { PayoutModule } from '../../payouts/payout.module';
import { PayoutService } from '../../payouts/payout.service';

const createPayoutsCron = async () => {
  const app = await NestFactory.createApplicationContext(AppModule);
  const configService = new ConfigService({ app: appConfig() });
  const defaultCommission = configService.get<number>('app.defaultCommission');

  const payoutService = app
    .select(PayoutModule)
    .get(PayoutService, { strict: true });

  const renewalService = app
    .select(RenewalModule)
    .get(RenewalService, { strict: true });

  const bookingService = app
    .select(BookingModule)
    .get(BookingService, { strict: true });

  const logger = new Logger();
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 1);

  const renewals = await renewalService.getByPaidDate(startDate, endDate);

  if (renewals?.length === 0) {
    logger.log(`No renewals found from ${startDate} to ${endDate}`);
    return;
  }

  logger.log(
    `Found ${renewals?.length} renewals with paid status from ${startDate} to ${endDate}`,
  );

  for (const renewal of renewals) {
    logger.log(`Found renewal: ${JSON.stringify(renewal)}`);

    const commissionPercentage =
      renewal?.booking?.site?.commission?.percentage || defaultCommission; // if no commission found then we charge default 15% commission
    const commissionAmount =
      (renewal?.sub_total_amount / 100) * commissionPercentage;

    const amount =
      renewal?.sub_total_amount - parseFloat(commissionAmount.toFixed(2));

    const payoutPayload: Partial<IPayoutEntity> = {
      status: PayoutStatus.PENDING,
      booking_id: renewal?.booking_id,
      renewal_id: renewal?.id,
      provider_id: renewal?.booking?.provider_id,
      amount,
      commission_percentage: commissionPercentage,
      currency: renewal?.transaction?.currency,
    };

    const t = await bookingService.getSequelizeInstance().transaction();

    try {
      const payout = await payoutService.create(payoutPayload, { t });

      logger.log(`Successfully created payout: ${JSON.stringify(payout)}`);

      await t.commit();
    } catch (e) {
      logger.error('Create Payout Error:', e?.stack);

      await t.rollback();
    }
  }

  await app.close();
};

void createPayoutsCron();
