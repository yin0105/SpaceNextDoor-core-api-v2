import { Logger, Module } from '@nestjs/common';

import { DbModule } from '../../db/db.module';
import { siteRuleProvider } from './site-rule.provider';
import { SiteRuleService } from './site-rule.service';

@Module({
  imports: [DbModule],
  providers: [...siteRuleProvider, SiteRuleService, Logger],
  exports: [SiteRuleService, ...siteRuleProvider],
})
export class SiteRuleModule {}
