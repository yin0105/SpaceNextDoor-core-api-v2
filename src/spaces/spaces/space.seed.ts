import {
  PlatformFeatureType,
  Space,
  SpaceSizeUnit,
  SpaceStatus,
} from '../../graphql.schema';
import { siteSeed } from '../../sites/sites/site.seed';

export const spaceSeed: Space = {
  id: 1,
  site: siteSeed,
  size: 8,
  height: 2.2,
  status: SpaceStatus.DRAFT,
  width: 3.2,
  length: 3.1,
  total_units: 5,
  available_units: 1,
  size_unit: SpaceSizeUnit.sqft,
  features: [
    {
      id: 1,
      name_en: 'name en',
      name_th: 'name th',
      name_jp: 'name jp',
      name_kr: 'name Kr',
      description_en: null,
      description_th: null,
      description_jp: null,
      description_kr: null,
      icon: null,
      is_active: true,
      type: PlatformFeatureType.SITE,
      category: {
        id: 1,
        name_en: 'name en',
        name_th: 'name th',
        name_jp: 'name jp',
        name_kr: 'name Kr',
        features: [],
      },
    },
  ],
  prices: [
    {
      id: 1,
      price_per_day: null,
      price_per_week: null,
      price_per_month: 20,
      price_per_year: null,
      type: null,
      currency_sign: '$',
      currency: 'USD',
      start_date: null,
      end_date: null,
    },
  ],
};
