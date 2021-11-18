import { Logger, Module } from '@nestjs/common';

import { DbModule } from '../../db/db.module';
import { StripeService } from '../../stripe/stripe.service';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
  imports: [DbModule],
  providers: [Logger, UserService, UserResolver, StripeService],
  exports: [UserService],
})
export class UserModule {}
