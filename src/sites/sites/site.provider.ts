import { SITE_REPOSITORY } from '../../shared/constant/app.constant';
import { SiteModel } from './site.model';

export const siteProvider = [
  {
    provide: SITE_REPOSITORY,
    useValue: SiteModel,
  },
];
