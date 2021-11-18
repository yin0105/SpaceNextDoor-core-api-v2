import { SITE_ADDRESS_REPOSITORY } from '../../shared/constant/app.constant';
import { SiteAddressModel } from './site-address.model';

export const siteAddressProvider = [
  {
    provide: SITE_ADDRESS_REPOSITORY,
    useValue: SiteAddressModel,
  },
];
