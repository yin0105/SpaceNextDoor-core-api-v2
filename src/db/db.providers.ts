import { ConfigService } from '@nestjs/config';
import { Sequelize } from 'sequelize-typescript';
import { Dialect } from 'sequelize/types';

import { AppliedTaxModel } from '../applied-taxes/applied-tax.model';
import { CustomerModel } from '../auth/customers/customer.model';
import { OTP } from '../auth/otp/otp.model';
import { ProviderModel } from '../auth/providers/provider.model';
import { UserModel } from '../auth/users/user.model';
import { BookingCancellationReasonsModel } from '../bookings/booking-cancellation-reasons/booking-cancellation-reasons.model';
import { BookingPromotionCustomerBuysModel } from '../bookings/promotions/customer_buys/customer_buys.model';
import { BookingPromotionCustomerGetsModel } from '../bookings/promotions/customer_gets/customer_gets.model';
import { BookingPromotionModel } from '../bookings/promotions/promotion/promotion.model';
import { CityModel } from '../countries/cities/city.model';
import { DistrictModel } from '../countries/districts/district.model';
import { LandmarkModel } from '../countries/landmarks/landmark.model';
import { EntityTaxModel } from '../entity-taxes/entity-tax.model';
import { IDCounterModel } from '../ids_counter/ids_counter.model';
import { OrderHistoryModel } from '../orders/order_history/order-history.model';
import { OrderModel } from '../orders/order.model';
import { PayoutModel } from '../payouts/payout.model';
import { PlatformAgreementModel } from '../platform/agreements/agreement.model';
import { PlatformBankModel } from '../platform/banks/bank.model';
import { PlatformCommissionModel } from '../platform/commissions/commission.model';
import { PlatformFeatureCategoryModel } from '../platform/features/categories/feature-category.model';
import { PlatformInsuranceModel } from '../platform/insurances/insurance.model';
import { PlatformPropertyTypeModel } from '../platform/property-types/property-type.model';
import { PlatformServiceModel } from '../platform/services/service.model';
import { PlatformSpaceCategoryItemModel } from '../platform/space-categories/items/space-category-item.model';
import { PlatformSpaceCategoryModel } from '../platform/space-categories/space-category.model';
import { SpaceTypeFeatureModel } from '../platform/space-types/features/feature.model';
import { PlatformTaxModel } from '../platform/taxes/tax.model';
import { PromotionCustomerBuysModel } from '../promotions/customer_buys/customer_buys.model';
import { PromotionCustomerGetsModel } from '../promotions/customer_gets/customer_gets.model';
import { PromotionModel } from '../promotions/promotion/promotion.model';
import { PromotionRedeemModel } from '../promotions/redeem/redeem.model';
import {
  APPLIED_TAX_REPOSITORY,
  CUSTOMER_REPOSITORY,
  ENTITY_TAX_REPOSITORY,
  OTP_REPOSITORY,
  PLATFORM_AGREEMENT_REPOSITORY,
  PLATFORM_TAX_REPOSITORY,
  PROVIDER_REPOSITORY,
  QUOTATION_ITEM_REPOSITORY,
  QUOTATION_REPOSITORY,
  SEQUELIZE_PROVIDER,
  SITE_DOOR_HISTORY_REPOSITORY,
  SITE_DOOR_REPOSITORY,
  USER_REPOSITORY,
} from '../shared/constant/app.constant';
import { DBHooksUtil } from '../shared/db.hooks';
import { SiteDoorHistoryModel } from '../sites/site-doors/site-doors-history/site-door-history.model';
import { TerminationModel } from '../terminations/termination.model';
import { RefreshTokenModel } from './../auth/refresh_token/refresh-token.model';
import { BookingHistoryModel } from './../bookings/booking-history/booking-history.model';
import { BookingSiteAddressModel } from './../bookings/booking-site-addresses/booking-site-address.model';
import { BookingSiteFeatureModel } from './../bookings/booking-site-features/booking-site-feature.model';
import { BookingSpaceFeatureModel } from './../bookings/booking-space-features/booking-space-feature.model';
import { BookingModel } from './../bookings/booking.model';
import { RenewalModel } from './../bookings/renewals/renewal.model';
import { TransactionModel } from './../bookings/transactions/transaction.model';
import { CountryModel } from './../countries/country.model';
import { OrderPickUpServiceModel } from './../orders/pick_up_service/order-pick-up-service.model';
import { PlatformFeatureModel } from './../platform/features/feature.model';
import { PlatformPolicyModel } from './../platform/policies/policy.model';
import { PlatformRuleModel } from './../platform/rules/rule.model';
import { PlatformSpaceTypeModel } from './../platform/space-types/space-type.model';
import { QuotationItemModel } from './../quotations/models/quotation-item.model';
import { QuotationModel } from './../quotations/models/quotation.model';
import { RabbitMQService } from './../rabbitmq/rabbitmq.service';
import { RefundModel } from './../refunds/refund.model';
import { SiteAddressModel } from './../sites/site-addresses/site-address.model';
import { SiteDoorModel } from './../sites/site-doors/site-door.model';
import { SiteFeatureModel } from './../sites/site-features/site-feature.model';
import { SitePolicyModel } from './../sites/site-policies/site-policy.model';
import { SiteRuleModel } from './../sites/site-rules/site-rule.model';
import { SiteModel } from './../sites/sites/site.model';
import { CalendarModel } from './../spaces/calendars/calendar.model';
import { PriceModel } from './../spaces/prices/price.model';
import { SpaceFeatureModel } from './../spaces/space-features/space-feature.model';
import { SpaceModel } from './../spaces/spaces/space.model';

const dbHooksUtil = new DBHooksUtil();
export const databaseProviders = [
  {
    provide: SEQUELIZE_PROVIDER,
    useFactory: async (
      configService: ConfigService,
      conn: RabbitMQService,
    ): Promise<Sequelize> => {
      const sequelize = new Sequelize({
        dialect: configService.get<Dialect>('app.db.dialect'),
        host: configService.get<string>('app.db.host'),
        port: configService.get<number>('app.db.port'),
        username: configService.get<string>('app.db.username'),
        password: configService.get<string>('app.db.password'),
        database: configService.get<string>('app.db.name'),
        pool: {
          max: 100,
        },
        define: {
          hooks: {
            afterCreate(instance) {
              return dbHooksUtil.afterCreate(instance.toJSON(), conn);
            },
            afterUpdate(instance) {
              return dbHooksUtil.afterUpdate(instance.toJSON(), conn);
            },
            afterSave(instance) {
              return dbHooksUtil.afterUpdate(instance.toJSON(), conn);
            },
            afterDestroy(instance) {
              return dbHooksUtil.afterDelete(instance?.toJSON(), conn);
            },
            beforeBulkDestroy(options) {
              options.individualHooks = true;
            },
            beforeBulkUpdate(options) {
              options.individualHooks = true;
            },
          },
        },
      });
      sequelize.addModels([
        OTP,
        SiteModel,
        SiteAddressModel,
        UserModel,
        SpaceModel,
        SiteFeatureModel,
        SiteRuleModel,
        SitePolicyModel,
        CountryModel,
        CityModel,
        DistrictModel,
        LandmarkModel,
        PlatformPropertyTypeModel,
        CustomerModel,
        ProviderModel,
        PlatformFeatureCategoryModel,
        PlatformAgreementModel,
        PlatformFeatureModel,
        PlatformSpaceTypeModel,
        PlatformPolicyModel,
        PlatformRuleModel,
        PlatformSpaceCategoryModel,
        PlatformCommissionModel,
        PlatformSpaceCategoryItemModel,
        SpaceTypeFeatureModel,
        SpaceFeatureModel,
        CalendarModel,
        PriceModel,
        BookingModel,
        BookingSiteAddressModel,
        BookingSpaceFeatureModel,
        BookingSiteFeatureModel,
        BookingCancellationReasonsModel,
        BookingHistoryModel,
        RenewalModel,
        PlatformInsuranceModel,
        PlatformServiceModel,
        OrderPickUpServiceModel,
        OrderHistoryModel,
        TransactionModel,
        PromotionModel,
        PromotionCustomerBuysModel,
        PromotionCustomerGetsModel,
        PromotionRedeemModel,
        PlatformTaxModel,
        BookingPromotionModel,
        BookingPromotionCustomerGetsModel,
        BookingPromotionCustomerBuysModel,
        IDCounterModel,
        PayoutModel,
        OrderModel,
        TerminationModel,
        RefundModel,
        PlatformBankModel,
        RefreshTokenModel,
        AppliedTaxModel,
        EntityTaxModel,
        SiteDoorModel,
        QuotationModel,
        QuotationItemModel,
        SiteDoorHistoryModel,
      ]);
      await sequelize.sync({
        // force: true,
      });
      return sequelize;
    },
    inject: [ConfigService, RabbitMQService],
  },
  {
    provide: USER_REPOSITORY,
    useValue: UserModel,
  },
  {
    provide: OTP_REPOSITORY,
    useValue: OTP,
  },
  {
    provide: CUSTOMER_REPOSITORY,
    useValue: CustomerModel,
  },
  {
    provide: PROVIDER_REPOSITORY,
    useValue: ProviderModel,
  },
  {
    provide: PLATFORM_TAX_REPOSITORY,
    useValue: PlatformTaxModel,
  },
  {
    provide: PLATFORM_AGREEMENT_REPOSITORY,
    useValue: PlatformAgreementModel,
  },
  {
    provide: ENTITY_TAX_REPOSITORY,
    useValue: EntityTaxModel,
  },
  {
    provide: APPLIED_TAX_REPOSITORY,
    useValue: AppliedTaxModel,
  },
  {
    provide: SITE_DOOR_REPOSITORY,
    useValue: SiteDoorModel,
  },
  {
    provide: SITE_DOOR_HISTORY_REPOSITORY,
    useValue: SiteDoorHistoryModel,
  },
  {
    provide: QUOTATION_REPOSITORY,
    useValue: QuotationModel,
  },
  {
    provide: QUOTATION_ITEM_REPOSITORY,
    useValue: QuotationItemModel,
  },
];
