import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import appConfig from '../../config/app.config';
const configService = new ConfigService({ app: appConfig() });

export interface IAvailableSpace {
  id: number;
  available_units: number;
  available_until?: Date;
}
export interface IAvailableSite {
  id: number;
  spaces: IAvailableSpace[];
}

interface IStockFilter {
  site_ids: number[];
  move_in_date?: Date;
  move_out_date?: Date;
}
export const getAvailableStocks = async (
  stockFilter?: IStockFilter,
): Promise<IAvailableSite[]> => {
  const res = await axios.post(
    configService.get('app.stockService.filter'),
    stockFilter,
  );
  if (!res.data.sites) {
    throw new Error('Unable to get stocks');
  }
  // eslint-disable-next-line no-restricted-syntax
  return res.data.sites as IAvailableSite[];
};
