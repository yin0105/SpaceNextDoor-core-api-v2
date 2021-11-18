import { SMSNames, smsTemplateT } from '../../../shared/mailer/email-templates';
import { NotificationService } from '../../../shared/notifications/notification.service';
import { IChannel } from './channel.interface';

export class PhoneChannel implements IChannel {
  private readonly notificationService: NotificationService;
  private readonly language: string;
  constructor(language = 'en-US') {
    this.notificationService = new NotificationService();
    this.language = language;
  }

  /**
   * Sends a message to the phone provided. In case of failed messages, throws an error.
   * @param {string} message Message to be delivered
   * @param {string} phone Receivers phone
   * @returns {Promise<string>} Returns the message id of the message delivered.
   */
  public async send(otp: string, phone: string): Promise<string> {
    // send OTP here to phone
    const message = smsTemplateT(SMSNames.OTP_MESSAGE, this.language)({ otp });
    return await this.notificationService.sendSMS(phone, message);
  }
}
