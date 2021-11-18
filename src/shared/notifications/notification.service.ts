import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isArray } from 'lodash';
import { Twilio } from 'twilio';

import appConfig from '../../config/app.config';
import { getCountryBaseCSEmail } from '../../shared/utils/country-config';
import { TemplateNames } from '../mailer/email-templates';
import { MailerService } from '../mailer/mailer';

/* eslint-disable @typescript-eslint/restrict-template-expressions */
interface IEmailOptions {
  template_name?: TemplateNames;
  template_id?: string;
  data: IDynamicTemplateData;
  country?: string;
  sendToCS?: boolean;
}

interface IDynamicTemplateData {
  [x: string]:
    | string
    | number
    | boolean
    | Date
    | Record<string, string | number | boolean | Date>
    | Record<string, string | number | boolean | Date>[]
    | any;
}

interface ICustomEmailOptions {
  subject: string;
  body: string;
}

export class NotificationService {
  private readonly mailerService: MailerService;
  private readonly configService: ConfigService;
  private readonly logger: Logger;

  constructor() {
    this.configService = new ConfigService({ app: appConfig() });
    this.mailerService = new MailerService();
    this.logger = new Logger('NotificationService', true);
  }

  async sendCustomEmail(
    to: string[],
    options: ICustomEmailOptions,
  ): Promise<void> {
    this.logger.log(`Sending Custom emails to "${to.join(', ')}"`);

    await this.mailerService.send({
      to,
      subject: options.subject,
      html: options.body,
    });
  }

  async sendEmail(
    to: string | string[],
    options: IEmailOptions,
  ): Promise<void> {
    if (!to) {
      return;
    }

    const emails = isArray(to) ? to : [to];
    this.logger.log(
      `Sending ${
        options.template_name || options.template_id
      } emails to "${emails.join(', ')}" with data ${JSON.stringify(
        options?.data,
      )}`,
    );

    try {
      // send BCC email to Customer Support only in Production env.
      const isProdEnv = this.configService.get('app.nodeEnv') === 'production';
      await this.mailerService.sendToTemplate({
        to,
        templateName: options.template_name,
        templateId: options.template_id,
        dynamic_template_data: options?.data,
        bcc:
          options.sendToCS && isProdEnv
            ? getCountryBaseCSEmail(options.country)
            : null,
      });
    } catch (err) {
      this.logger.error(`Couldn't send email to ${emails}`, err?.stack);
    }
  }

  public async sendSMS(phone: string, message: string): Promise<string> {
    this.logger.log(`Sending SMS to ${phone}`);

    const twilio = new Twilio(
      this.configService.get('app.twilio.accountId'),
      this.configService.get('app.twilio.authToken'),
    );

    const result = await twilio.messages.create({
      body: message,
      to: phone,
      from: this.configService.get('app.twilio.senderPhone'),
    });

    if (['undelivered', 'failed'].includes(result.status) || result.errorCode) {
      throw new Error('Failed to send message to the phone number provided');
    }

    return result.sid;
  }
}
