import { Logger, Module } from '@nestjs/common';

import { NotificationsResolver } from './notifications.resolver';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [],
  providers: [NotificationsResolver, NotificationsService, Logger],
  exports: [],
})
export class NotificationsModule {}
