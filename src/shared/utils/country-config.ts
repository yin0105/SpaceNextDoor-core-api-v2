import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

import appConfig from '../../config/app.config';
import { FixedCountry, SpaceSizeUnit } from '../../graphql.schema';

dotenv.config();

const configService = new ConfigService({ app: appConfig() });

export const getBaseUrlFromUrlString = (urlStr: string): string => {
  // eslint-disable-next-line no-restricted-syntax
  console.log('Domain UrlStr: ', urlStr);
  const pathArray = urlStr.split('/');
  const protocol = pathArray[0];
  const host = pathArray[2];
  const url = protocol + '//' + host;
  // eslint-disable-next-line no-restricted-syntax
  console.log('Domain URL: ', url);
  return url;
};

export const getClientBaseUrl = (country: string): FixedCountry => {
  switch (country) {
    case FixedCountry.Singapore:
      return configService.get('app.clientApp.baseUrl');
    case FixedCountry.Thailand:
      return configService.get('app.clientApp.baseUrlTH');
    case FixedCountry.Japan:
      return configService.get('app.clientApp.baseUrlJP');
    case FixedCountry.Korea:
      return configService.get('app.clientApp.baseUrlKR');
    default:
      return configService.get('app.clientApp.baseUrl');
  }
};

export const getCountryBaseCSEmail = (country?: string): string => {
  if (!country) {
    country = FixedCountry.Singapore;
  }
  return configService.get('app.csEmail')[country.toLowerCase()];
};

export const getMeasureUnit = (sizeUnit: SpaceSizeUnit): string => {
  switch (sizeUnit) {
    case SpaceSizeUnit.sqft:
      return 'ft';
    case SpaceSizeUnit.sqm:
      return 'm';
    case SpaceSizeUnit.tatami:
      return 'tatami';
    default:
      return 'ft';
  }
};

export const getLocaleFromLang = (lang: string): string => {
  switch (lang) {
    case 'en-US':
      return 'en';
    case 'th':
      return 'th';
    case 'ja':
      return 'jp';
    case 'kr':
      return 'kr';
    default:
      return 'en';
  }
};
