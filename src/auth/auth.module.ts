import { Logger, Module } from '@nestjs/common';

import { DbModule } from '../db/db.module';
import { StripeModule } from '../stripe/stripe.module';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { FacebookService } from './facebook/facebook.service';
import { GoogleService } from './google/google.service';
import { OTPService } from './otp/otp.services';
import { refreshTokenProvider } from './refresh_token/refresh-token.provider';
import { RefreshTokenService } from './refresh_token/refresh-token.service';
import { UserService } from './users/user.service';
@Module({
  imports: [DbModule, StripeModule],
  providers: [
    Logger,
    AuthService,
    UserService,
    OTPService,
    AuthResolver,
    FacebookService,
    GoogleService,
    RefreshTokenService,
    ...refreshTokenProvider,
  ],
  exports: [UserService, AuthService, RefreshTokenService],
})
export class AuthModule {}
