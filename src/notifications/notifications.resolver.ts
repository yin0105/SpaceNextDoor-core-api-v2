import { Logger } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { Auth } from '../auth/auth.decorators';
import { UserRoles } from '../auth/users/interfaces/user.interface';
import {
  NotificationResult,
  NotificationType,
  SendNotificationFilter,
  SendNotificationPayload,
} from '../graphql.schema';
import { PayloadError } from '../shared/errors.messages';
import { NotificationsService } from './notifications.service';

@Resolver('Notifications')
export class NotificationsResolver {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(NotificationsResolver.name);
  }

  @Auth(UserRoles.ADMIN)
  @Mutation('sendNotification')
  async sendNotification(
    @Args('payload') payload: SendNotificationPayload,
    @Args('where') where: SendNotificationFilter,
  ): Promise<NotificationResult> {
    if (payload.type === NotificationType.SMS && !payload.sms_text) {
      throw PayloadError('SMS body is required');
    }

    if (
      payload.type === NotificationType.EMAIL &&
      !payload.template_id &&
      !payload.email_custom_message
    ) {
      throw PayloadError('Template or custom message is required');
    }

    return await this.notificationsService.send(payload, where);
  }
}
