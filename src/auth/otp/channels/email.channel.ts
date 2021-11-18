import {
  getEmailTemplateT,
  TemplateNames,
} from '../../../shared/mailer/email-templates';
import { NotificationService } from '../../../shared/notifications/notification.service';
import { IChannel } from './channel.interface';

export class EmailChannel implements IChannel {
  private readonly notificationService: NotificationService;
  private readonly language: string;
  constructor(language = 'en-US') {
    this.language = language;
    this.notificationService = new NotificationService();
  }

  /**
   * Sends a message to the email provided. In case of failed messages, throws an error.
   * @param {string} message Message to be delivered
   * @param {string} email Receivers email address
   * @returns {Promise<string>}
   */
  public async send(otp: string, email: string): Promise<string> {
    try {
      await this.notificationService.sendEmail(email, {
        data: {
          OTP_CODE: otp,
        },
        template_id: getEmailTemplateT(TemplateNames.SEND_OTP, this.language),
      });
      return 'sent';
    } catch (error) {
      throw new Error('Failed to send message to the email address provided');
    }
  }
}
