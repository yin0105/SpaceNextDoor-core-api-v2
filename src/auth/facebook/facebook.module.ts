import { Logger, Module } from '@nestjs/common';

import { DbModule } from '../../db/db.module';
import { StripeModule } from '../../stripe/stripe.module';
import { AuthService } from '../auth.service';
import { UserService } from '../users/user.service';
import { FacebookController } from './facebook.controller';
import { FacebookStrategy } from './facebook.strategy';
import { FacebookStrategyJp } from './facebook.strategy.jp';
import { FacebookStrategyKr } from './facebook.strategy.kr';
import { FacebookStrategyTh } from './facebook.strategy.th';

@Module({
  imports: [DbModule, StripeModule],
  controllers: [FacebookController],
  providers: [
    FacebookStrategy,
    FacebookStrategyJp,
    FacebookStrategyKr,
    FacebookStrategyTh,
    UserService,
    AuthService,
    Logger,
  ],
})
export class OAuthFacebookModule {}
