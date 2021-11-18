import { BOOKING_SPACE_FEATURE_REPOSITORY } from '../../shared/constant/app.constant';
import { BookingSpaceFeatureModel } from './booking-space-feature.model';

export const bookingSpaceFeatureProvider = [
  {
    provide: BOOKING_SPACE_FEATURE_REPOSITORY,
    useValue: BookingSpaceFeatureModel,
  },
];
