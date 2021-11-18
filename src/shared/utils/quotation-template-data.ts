import dayjs, { Dayjs } from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';

import { FixedCountry, Space } from '../../graphql.schema';
import { QuotationModel } from '../../quotations/models/quotation.model';
import { getTranslatedName } from '../lang.messages';
import {
  getClientBaseUrl,
  getLocaleFromLang,
  getMeasureUnit,
} from './country-config';

export enum IQType {
  QUOTATION = 'QUOTATION',
  REMINDER = 'REMINDER',
  REJECTED = 'REJECTED',
}
interface IQuotationEmailSpace extends Partial<Space> {
  measure_unit: string;
  price: number;
  discount: number;
  currency_sign: string;
  features_str: string;
  checkout_url: string;
}

interface IQuotationEmailSite {
  name: string;
  storage_unit: string;
  address: string;
  site_amenities: string;
  details_url: string;
  image: string;
  is_multiple_spaces: boolean;
  spaces: IQuotationEmailSpace[];
}

interface IQuotationEmailData {
  user_name: string;
  ref_number: string;
  district_names: string;
  created_at: string;
  date_created_at: string;
  move_in: string;
  move_out: string;
  app_base_url: string;
  is_rejected: boolean;
  is_reminder: boolean;
  is_quotation: boolean;
  voucher_code?: string;
  expiry_date_time: string;
  requested_date: string;
  sites: IQuotationEmailSite[];
}

const getQuotationTemplateData = (
  quotation: QuotationModel,
  qType: IQType,
  expiryDate?: Dayjs,
): IQuotationEmailData => {
  dayjs.extend(localizedFormat);
  const lang = getLocaleFromLang(quotation?.user?.preferred_language);
  const districtNames = quotation?.items?.map((item) =>
    getTranslatedName(item.site?.address?.district, 'name', lang),
  );

  let appBaseUrl = getClientBaseUrl(FixedCountry.Singapore);
  const itemsBySites: IQuotationEmailSite[] = quotation.items.reduce(
    (sites, item) => {
      appBaseUrl = getClientBaseUrl(item.site?.address?.country?.name_en);

      const full_address = `${item.site?.address?.street} ${getTranslatedName(
        item.site?.address?.district,
        'name',
        lang,
      )} ${getTranslatedName(
        item.site?.address?.city,
        'name',
        lang,
      )} ${getTranslatedName(item.site?.address?.country, 'name', lang)}`;
      const amenities = item.site?.features
        .map((itemFeature) =>
          getTranslatedName(itemFeature.feature, 'name', lang),
        )
        .toString();

      const spaceData: IQuotationEmailSpace = {
        ...(item.space?.toJSON ? item.space?.toJSON() : item.space),
        measure_unit: getMeasureUnit(item.space.size_unit),
        price: item.space?.prices[0].price_per_month,
        discount: parseFloat(
          (
            item.space?.prices[0].price_per_month -
            item.space?.prices[0].price_per_month * 0.1
          ).toFixed(2),
        ), // discount 10%
        currency_sign: item.space?.prices[0].currency_sign,
        features_str: item?.space?.features
          ?.map(
            (feature) =>
              getTranslatedName(feature?.feature, 'name', lang) || null,
          )
          .filter(Boolean)
          .join(', '),
        checkout_url: `${getClientBaseUrl(
          item.site?.address?.country?.name_en,
        )}/checkout?space_id=${item.space.id}&quotation=${quotation.uuid}`,
      };

      let siteExists = false;
      sites = sites.map((s) => {
        if (s.id === item.site_id) {
          siteExists = true;
          s.spaces = s.spaces || [];
          s.spaces.push(spaceData);
          return s;
        }

        return s;
      });

      if (!siteExists) {
        const type = item.space?.platform_space_type;
        sites.push({
          id: item.site_id,
          name: item?.site.name,
          storage_unit: `${type?.name_en} ${type?.size_from}-${type?.size_to} ${type?.unit}`,
          address: full_address,
          site_amenities: amenities,
          details_url: `${getClientBaseUrl(
            item.site?.address?.country?.name_en,
          )}/details/${item.site.id}?quotation=${quotation.uuid}`,
          image: item.site.images[0],
          is_multiple_spaces:
            quotation.items.filter((i) =>
              quotation.items.map((s) => s.site_id).includes(i.site_id),
            ).length > 1,
          spaces: [spaceData],
        });
      }

      return sites;
    },
    [],
  );
  return {
    is_rejected: qType == IQType.REJECTED,
    is_reminder: qType == IQType.REMINDER,
    is_quotation: qType == IQType.QUOTATION,
    voucher_code: '',
    app_base_url: appBaseUrl,
    expiry_date_time: expiryDate
      ? `${expiryDate.endOf('day').format('LLLL')}`
      : '',
    user_name: `${quotation?.user?.first_name || ''}${
      quotation?.user?.last_name ? ' ' + quotation?.user?.last_name : ''
    }`,
    ref_number: quotation?.uuid?.split('-')[0],
    district_names: [...new Set(districtNames)].toString(),
    created_at: `${dayjs(quotation?.created_at).format(
      'LLLL',
    )} ${getTranslatedName(quotation.country, 'name', lang)} Standard Time`,
    requested_date: `${dayjs(quotation?.created_at).format('LL')}`,
    date_created_at: dayjs(quotation?.created_at).format('LL'),
    move_in: dayjs(quotation?.move_in_date).format('LL'),
    move_out: quotation?.move_out_date
      ? dayjs(quotation?.move_out_date).format('LL')
      : '-',
    sites: itemsBySites,
  };
};

export default getQuotationTemplateData;
