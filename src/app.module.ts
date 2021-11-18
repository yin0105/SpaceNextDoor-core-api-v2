import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { TerminusModule } from '@nestjs/terminus';
import GraphQLJSON, { GraphQLJSONObject } from 'graphql-type-json';
import _ from 'lodash';

import { AppliedTaxModule } from './applied-taxes/applied-tax.module';
import { AuthModule } from './auth/auth.module';
import { OAuthFacebookModule } from './auth/facebook/facebook.module';
import { OAuthGoogleModule } from './auth/google/google.module';
import { UserModule } from './auth/users/user.module';
import { BookingModule } from './bookings/booking.module';
import appConfig from './config/app.config';
import { CountryModule } from './countries/country.module';
import { DbModule } from './db/db.module';
import { IDCounterModule } from './ids_counter/ids_counter.module';
import { InvoiceModule } from './invoices/invoice.module';
import { LogisticsModule } from './logistics/logistics.module';
import { MediaModule } from './media/media.module';
import { NotificationsModule } from './notifications/notifications.module';
import { OrderHistoryModule } from './orders/order_history/order-history.module';
import { OrderModule } from './orders/order.module';
import { OrderPickUpServiceModule } from './orders/pick_up_service/order-pick-up-service.module';
import { PayoutModule } from './payouts/payout.module';
import { PlatformBankModule } from './platform/banks/bank.module';
import { PlatformCommissionModule } from './platform/commissions/commission.module';
import { PlatformFeatureCategoryModule } from './platform/features/categories/feature-category.module';
import { PlatformFeatureModule } from './platform/features/feature.module';
import { PlatformInsuranceModule } from './platform/insurances/insurance.module';
import { PropertyTypeModule } from './platform/property-types/property-type.module';
import { PlatformServiceModule } from './platform/services/service.module';
import { PlatformSpaceCategoryModule } from './platform/space-categories/space-category.module';
import { PlatformSpaceTypeModule } from './platform/space-types/space-type.module';
import { PromotionModule } from './promotions/promotion/promotion.module';
import { QuotationModule } from './quotations/quotation.module';
import { RabbitMQAppModule } from './rabbitmq/rabbitmq.module';
import { RefundModule } from './refunds/refund.module';
import { ReviewModule } from './reviews/review.module';
import { APOLLO_REPORT_INTERVAL_MS } from './shared/constant/app.constant';
import { TerminusOptionsService } from './shared/health-check/terminus-options.service';
import { TimeoutInterceptor } from './shared/interceptor/timeout.interceptor';
import { SiteDoorModule } from './sites/site-doors/site-door.module';
import { SiteModule } from './sites/sites/site.module';
import { SpaceModule } from './spaces/spaces/space.module';
import { TerminationModule } from './terminations/termination.module';

@Module({
  imports: [
    DbModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    PlatformServiceModule,
    AuthModule,
    OAuthGoogleModule,
    SiteModule,
    InvoiceModule,
    SpaceModule,
    MediaModule,
    CountryModule,
    PropertyTypeModule,
    PlatformFeatureCategoryModule,
    PlatformFeatureModule,
    PlatformSpaceTypeModule,
    PlatformSpaceCategoryModule,
    BookingModule,
    ReviewModule,
    OAuthFacebookModule,
    UserModule,
    PayoutModule,
    NotificationsModule,
    PromotionModule,
    PlatformCommissionModule,
    PlatformInsuranceModule,
    OrderHistoryModule,
    OrderPickUpServiceModule,
    IDCounterModule,
    OrderModule,
    QuotationModule,
    RefundModule,
    LogisticsModule,
    TerminationModule,
    PlatformBankModule,
    AppliedTaxModule,
    SiteDoorModule,
    RabbitMQAppModule,
    GraphQLModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        include: [],
        typePaths: ['./**/**/*.graphql'],
        installSubscriptionHandlers: true,
        context: ({ request }) => ({ req: request }),
        introspection: true,
        tracing: true,
        playground: true,
        debug: configService.get<string>('app.nodeEnv') === 'development',
        engine: {
          graphVariant: configService.get<string>('app.nodeEnv'),
          apiKey: configService.get<string>('app.apolloEngineApiKey'),
          reportIntervalMs: APOLLO_REPORT_INTERVAL_MS,
          sendVariableValues: {
            all: true,
          },
          sendHeaders: {
            exceptNames: ['Authorization', 'authorization'],
          },
        },
        resolverValidationOptions: {
          requireResolversForResolveType: false,
        },
        resolvers: {
          JSON: GraphQLJSON,
          JSONObject: GraphQLJSONObject,
        },
        formatError: (error) => {
          try {
            error.message = JSON.parse(error.message);
          } catch (e) {
            // Empty
          }
          return {
            ...error,
            message: error.message,
            code: _.get(error, 'extensions.exception.title', 'UNKNOWN'),
            locations: error.locations,
            path: error.path,
          };
        },
        formatResponse: (response) => response,
      }),
      inject: [ConfigService],
    }),
    TerminusModule.forRootAsync({
      imports: [DbModule, RabbitMQAppModule],
      useClass: TerminusOptionsService,
      inject: [Logger, RabbitMQAppModule],
    }),
  ],

  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
  ],
})
export class AppModule {}
