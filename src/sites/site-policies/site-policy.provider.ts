import { SITE_POLICY_REPOSITORY } from '../../shared/constant/app.constant';
import { SitePolicyModel } from './site-policy.model';

export const sitePolicyProvider = [
  {
    provide: SITE_POLICY_REPOSITORY,
    useValue: SitePolicyModel,
  },
];
