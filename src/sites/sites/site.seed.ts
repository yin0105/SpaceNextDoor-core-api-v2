import {
  City,
  District,
  PlatformFeatureType,
  PolicyType,
  ProviderType,
  Site,
  SiteAddress,
} from '../../graphql.schema';

const district: District = {
  id: 1,
  name_en: '',
  name_jp: '',
  name_kr: '',
  name_th: '',
};

const city: City = {
  id: 1,
  name_en: '',
  name_jp: '',
  name_kr: '',
  name_th: '',
  districts: [district],
};

const siteAddress: SiteAddress = {
  id: 1,
  city,
  district,
  street: '',
  postal_code: '',
  lat: 124,
  lng: 123,
  created_at: new Date(),
  updated_at: new Date(),
  country: {
    id: 1,
    name_en: '',
    name_jp: '',
    name_kr: '',
    name_th: '',
    code: '+85',
    currency: 'USD',
    currency_sign: '$',
    cities: [city],
  },
};

export const siteSeed: Site = {
  id: 1,
  name: 'test site 1',
  description: 'test description',
  provider_type: ProviderType.BUSINESS,
  property_type: {
    id: 1,
    name_en: '',
    name_jp: '',
    name_kr: '',
    name_th: '',
  },
  spaces: {
    edges: [],
    page_info: {
      limit: 10,
      skip: 0,
      total: 10,
    },
  },
  similar_sites: [],
  address: siteAddress,
  is_featured: false,
  created_at: new Date(),
  updated_at: new Date(),
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
  rules: [
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
    },
  ],
  policies: [
    {
      id: 1,
      name_en: 'name en',
      name_th: 'name th',
      name_jp: 'name jp',
      name_kr: 'name Kr',
      type: PolicyType.RENEWAL,
      days: 12,
    },
  ],
  reviews: {
    average_rating: 0,
    total: 0,
  },
};
