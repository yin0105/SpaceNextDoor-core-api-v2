import { BOOKING_SITE_ADDRESS_REPOSITORY } from '../../shared/constant/app.constant';
import { BookingSiteAddressModel } from './booking-site-address.model';

export const bookingSiteAddressProvider = [
  {
    provide: BOOKING_SITE_ADDRESS_REPOSITORY,
    useValue: BookingSiteAddressModel,
  },
];
