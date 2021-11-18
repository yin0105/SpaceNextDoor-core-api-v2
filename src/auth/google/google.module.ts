import { Logger, Module } from '@nestjs/common';

import { DbModule } from '../../db/db.module';
import { StripeModule } from '../../stripe/stripe.module';
import { AuthService } from '../auth.service';
import { UserService } from '../users/user.service';
import { GoogleController } from './google.controller';
import { GoogleStrategy } from './google.strategy';
import { GoogleStrategyJp } from './google.strategy.jp';
import { GoogleStrategyKr } from './google.strategy.kr';
import { GoogleStrategyTh } from './google.strategy.th';

@Module({
  imports: [DbModule, StripeModule],
  controllers: [GoogleController],
  providers: [
    GoogleStrategy,
    GoogleStrategyJp,
    GoogleStrategyTh,
    GoogleStrategyKr,
    UserService,
    AuthService,
    Logger,
  ],
})
export class OAuthGoogleModule {}
