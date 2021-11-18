import { forwardRef, Logger, Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { DbModule } from '../db/db.module';
import { PromotionModule } from '../promotions/promotion/promotion.module';
import { ClevertapService } from '../shared/clevertap/clevertap.service';
import { siteAddressProvider } from '../sites/site-addresses/site-address.provider';
import { SiteAddressService } from '../sites/site-addresses/site-address.service';
import { SiteModule } from '../sites/sites/site.module';
import { siteProvider } from '../sites/sites/site.provider';
import { SpaceModule } from '../spaces/spaces/space.module';
import { spaceProvider } from '../spaces/spaces/space.provider';
import { QuotationResolver } from './quotation.resolver';
import { QuotationService } from './quotation.service';

@Module({
  imports: [
    DbModule,
    forwardRef(() => SiteModule),
    AuthModule,
    forwardRef(() => SpaceModule),
    forwardRef(() => PromotionModule),
  ],
  providers: [
    ...siteProvider,
    ...spaceProvider,
    ...siteAddressProvider,
    QuotationResolver,
    QuotationService,
    SiteAddressService,
    ClevertapService,
    Logger,
  ],
  exports: [QuotationService],
})
export class QuotationModule {}
