import { ConfigService } from '@nestjs/config';
import mailer from '@sendgrid/mail';

import appConfig from '../../config/app.config';
import { getEmailTemplateT, TemplateNames } from './email-templates';

interface IEmailSendOptions {
  to: string | string[];
  subject: string;
  html: string;
}

interface IDynamicTemplateData {
  [x: string]:
    | string
    | number
    | boolean
    | Date
    | Record<string, string | number | boolean | Date>
    | Record<string, string | number | boolean | Date>[];
}

interface ITemplateOptions {
  to: string | string[];
  templateName?: TemplateNames;
  templateId?: string;
  dynamic_template_data: IDynamicTemplateData;
  bcc?: string | string[];
  locale?: string;
}

export class MailerService {
  private readonly configService: ConfigService;
  // Use the email address or domain you verified above
  private readonly fromEmail: string = 'noreply@spacenextdoor.com';
  constructor() {
    this.configService = new ConfigService({ app: appConfig() });
    mailer.setApiKey(this.configService.get('app.mail.apiKey'));
  }

  public async send(options: IEmailSendOptions): Promise<void> {
    const msg = {
      from: this.fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    await mailer.send(msg);
  }

  public async sendToTemplate(options: ITemplateOptions): Promise<void> {
    if (!options.templateId && !options.templateName) {
      throw new Error('Template Info required');
    }

    if (
      options.templateName &&
      !getEmailTemplateT(options.templateName, options.locale)
    ) {
      throw new Error(`Template for "${options.templateName}" not found`);
    }

    const msg = {
      from: this.fromEmail,
      to: options.to,
      templateId:
        options.templateId ||
        getEmailTemplateT(options.templateName, options.locale),
      dynamic_template_data: options.dynamic_template_data,
      bcc: options.bcc,
    };

    await mailer.send(msg);
  }
}
