import {
  PlatformFeatureCategory,
  PlatformFeatureType,
} from '../../../graphql.schema';

export const categorySeed: PlatformFeatureCategory = {
  id: 1,
  name_en: 'name en',
  name_th: 'name th',
  name_jp: 'name jp',
  name_kr: 'name Kr',
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
        // is_active: true,
      },
    },
  ],
};
