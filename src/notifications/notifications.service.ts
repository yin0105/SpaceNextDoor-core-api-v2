import { Injectable, Logger } from '@nestjs/common';

import {
  NotificationResult,
  NotificationType,
  SendNotificationFilter,
  SendNotificationPayload,
} from '../graphql.schema';
import { NotificationService } from '../shared/notifications/notification.service';

@Injectable()
export class NotificationsService {
  private readonly notificationService: NotificationService;
  constructor(private readonly logger: Logger) {
    this.logger.setContext(NotificationsService.name);
    this.notificationService = new NotificationService();
  }

  async send(
    payload: SendNotificationPayload,
    where: SendNotificationFilter,
  ): Promise<NotificationResult> {
    if (payload.type === NotificationType.SMS) {
      const phones = where.username._eq
        ? [where.username._eq]
        : where.username._in;

      await Promise.all(
        phones.map((phoneNumber) =>
          this.notificationService.sendSMS(phoneNumber, payload.sms_text),
        ),
      );
    } else if (payload.type === NotificationType.EMAIL) {
      const emails = where.username._eq
        ? [where.username._eq]
        : where.username._in;

      if (payload.template_id) {
        await this.notificationService.sendEmail(emails, {
          data: payload.template_body || {},
          template_id: payload.template_id,
        });
      } else if (payload.email_custom_message) {
        const args = {
          subject: payload.email_subject || 'Custom Message',
          body: payload.email_custom_message,
        };
        await this.notificationService.sendCustomEmail(emails, args);
      }
    }
    return { isSent: true };
  }
}
