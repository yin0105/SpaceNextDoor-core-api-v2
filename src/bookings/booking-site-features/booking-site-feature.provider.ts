import { BOOKING_SITE_FEATURE_REPOSITORY } from '../../shared/constant/app.constant';
import { BookingSiteFeatureModel } from './booking-site-feature.model';

export const bookingSiteFeatureProvider = [
  {
    provide: BOOKING_SITE_FEATURE_REPOSITORY,
    useValue: BookingSiteFeatureModel,
  },
];
