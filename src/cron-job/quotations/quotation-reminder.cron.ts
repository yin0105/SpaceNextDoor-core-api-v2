import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import dayjs from 'dayjs';

import { AppModule } from '../../app.module';
import { QuotationModel } from '../../quotations/models/quotation.model';
import { QuotationModule } from '../../quotations/quotation.module';
import { QuotationService } from '../../quotations/quotation.service';
import {
  getEmailTemplateT,
  TemplateNames,
} from '../../shared/mailer/email-templates';
import { NotificationService } from '../../shared/notifications/notification.service';
import getQuotationTemplateData, {
  IQType,
} from '../../shared/utils/quotation-template-data';

const quotationRemindCron = async () => {
  const app = await NestFactory.createApplicationContext(AppModule);
  const quotationService = app
    .select(QuotationModule)
    .get(QuotationService, { strict: true });
  const notificationService = new NotificationService();
  const logger = new Logger();

  try {
    const quotationsRemindDays = await quotationService.getQuotations({
      reminderDays: 6,
    });
    for (const quotation of quotationsRemindDays) {
      const promises = [];
      const quotationJson = (quotation.toJSON() as undefined) as QuotationModel;
      if (quotation) {
        promises.push(
          (async () => {
            try {
              await notificationService.sendEmail(quotation?.user?.email, {
                data: getQuotationTemplateData(
                  quotationJson,
                  IQType.REMINDER,
                  dayjs().add(1, 'day'),
                ),
                template_id: getEmailTemplateT(
                  TemplateNames.QUOTATION_REMINDER,
                ),
              });
              logger.log(
                `Successfully sent Remind quotation email to the provider
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
      }
      await Promise.all(promises);
    }
  } catch (error) {
    logger.error('Quotation remind Error:', error?.stack);
  }
  await app.close();
};
void quotationRemindCron();
