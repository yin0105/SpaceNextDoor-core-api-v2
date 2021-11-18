import { SITE_FEATURE_REPOSITORY } from '../../shared/constant/app.constant';
import { SiteFeatureModel } from './site-feature.model';

export const siteFeatureProvider = [
  {
    provide: SITE_FEATURE_REPOSITORY,
    useValue: SiteFeatureModel,
  },
];
