import { QuotationStatus } from '../../graphql.schema';
import { QuotationModel } from '../../quotations/models/quotation.model';
import { IQType } from '../../shared/utils/quotation-template-data';

interface IEventData {
  district: string;
  customerEmail: string;
  customerPhone: string;
  customerName: string;
  moveIn: Date;
  siteId: string;
  spaceId: string;
  CTSource: string | null;
  platform: string;
  country: string;
  userId: number;
  status: QuotationStatus;
  spaceSizeUnit: string;
  spaceSize: string;
  quotationId: string;
  createdAt: Date;
  expiredAt?: Date;
}

interface ICleverTapEventData {
  type: string;
  identity: string;
  evtName: string;
  evtData: IEventData;
}

const getQuotationClevertapData = (
  quotation: QuotationModel,
  qType: IQType,
  email?: string,
): [ICleverTapEventData] => {
  const districtNames = quotation?.items?.map(
    (item) => item.site?.address?.district.name_en,
  );

  return [
    {
      type: 'event',
      identity: quotation.user.email,
      evtName:
        qType === IQType.QUOTATION ? 'QuotationCreated' : 'QuotationExpired',
      evtData: {
        district: [...new Set(districtNames)].toString(),
        customerEmail: quotation.user?.email || email,
        customerPhone: quotation.user?.phone_number,
        customerName: quotation.user.first_name,
        moveIn: quotation?.move_in_date,
        siteId: [
          ...new Set(quotation.items.map((item) => item.site_id)),
        ].toString(),
        spaceId: quotation.items.map((item) => item.space_id).toString(),
        CTSource: null,
        platform: 'SERVER',
        country: quotation.country.name_en,
        userId: quotation.user?.id,
        status: quotation.status,
        spaceSizeUnit: [
          ...new Set(quotation.items.map((item) => item.space.size_unit)),
        ].toString(),
        spaceSize: [
          ...new Set(quotation.items.map((item) => item.space.size)),
        ].toString(),
        quotationId: quotation.uuid,
        createdAt: quotation.created_at,
        expiredAt: quotation.expired_at,
      },
    },
  ];
};

export default getQuotationClevertapData;
