import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StripeModule as Stripe } from 'nestjs-stripe';

import { DbModule } from '../db/db.module';
import { StripeService } from './stripe.service';

@Module({
  imports: [
    ConfigModule,
    DbModule,
    Stripe.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        apiKey: configService.get<string>('app.stripe.secretKey'),
        apiVersion: '2020-08-27',
      }),
    }),
  ],
  providers: [StripeService, Logger],
  exports: [StripeService],
})
export class StripeModule {}
