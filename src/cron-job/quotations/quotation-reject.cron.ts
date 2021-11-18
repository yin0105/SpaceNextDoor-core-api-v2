import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import dayjs from 'dayjs';

import { AppModule } from '../../app.module';
import { QuotationStatus } from '../../graphql.schema';
import { QuotationModel } from '../../quotations/models/quotation.model';
import { QuotationModule } from '../../quotations/quotation.module';
import { QuotationService } from '../../quotations/quotation.service';
import getQuotationClevertapData from '../../shared/clevertap/clevertap-data.utils';
import { ClevertapService } from '../../shared/clevertap/clevertap.service';
import {
  getEmailTemplateT,
  TemplateNames,
} from '../../shared/mailer/email-templates';
import { NotificationService } from '../../shared/notifications/notification.service';
import getQuotationTemplateData, {
  IQType,
} from '../../shared/utils/quotation-template-data';

const quotationRejectCron = async () => {
  const app = await NestFactory.createApplicationContext(AppModule);
  const quotationService = app
    .select(QuotationModule)
    .get(QuotationService, { strict: true });
  const clevertapService = app.get(ClevertapService);
  const notificationService = new NotificationService();
  const logger = new Logger();

  try {
    const quotationsRejectDays = await quotationService.getQuotations({
      rejectDays: 7,
    });

    for (const quotation of quotationsRejectDays) {
      await quotationService.updateQuotation(quotation.id, {
        status: QuotationStatus.REJECTED,
        expired_at: dayjs().toDate(),
      });
      logger.log(`Successfully rejected ${quotation?.id} quotation.`);
      const quotationJson = (quotation.toJSON() as undefined) as QuotationModel;
      const promises = [];

      if (quotation) {
        promises.push(
          (async () => {
            try {
              const data = getQuotationTemplateData(
                quotationJson,
                IQType.REJECTED,
                dayjs(),
              );
              await notificationService.sendEmail(quotation?.user?.email, {
                data,
                template_id: getEmailTemplateT(
                  TemplateNames.QUOTATION_REJECTED,
                ),
              });
              logger.log(
                `Successfully sent Rejected quotation email to the provider
              provider email: ${quotation?.user?.email}, booking id: ${quotation?.id}`,
              );
            } catch (e) {
              logger.log(
                `There was an error sending email to the provider. Quotation id ${quotation?.id}, email: ${quotation?.user?.email}`,
              );
              logger.log(e);
            }
          })(),
        );

        // push clever tap event
        promises.push(
          (async () => {
            try {
              const clevertapPayload = getQuotationClevertapData(
                quotationJson,
                IQType.REJECTED,
              );
              await clevertapService.pushEvents(clevertapPayload);
            } catch (e) {
              logger.log(
                `There was an error pushing event in clever tap. Quotation id ${quotation?.id}, email: ${quotation?.user?.email}`,
              );
              logger.log(e?.stack);
            }
          })(),
        );
      }

      //
      await Promise.all(promises);
    }
  } catch (error) {
    logger.error('Quotation reject Error:', error?.stack);
  }
  await app.close();
};
void quotationRejectCron();
