import { SITE_RULE_REPOSITORY } from '../../shared/constant/app.constant';
import { SiteRuleModel } from './site-rule.model';

export const siteRuleProvider = [
  {
    provide: SITE_RULE_REPOSITORY,
    useValue: SiteRuleModel,
  },
];
