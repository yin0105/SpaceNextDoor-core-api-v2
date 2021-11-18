import { Dayjs } from 'dayjs';

import { Termination, TerminationStatus } from '../../graphql.schema';

export interface ITerminationEntity extends Termination {
  booking_id: number;
  last_renewal_id: number;
}

export interface ICalculateTerminationDues {
  terminationDate: Dayjs;
  requestMoveOutDate: Dayjs;
  noticePeriodAmount: number;
  promoAmount: number;
  failedRenewalsAmount: number;
  remainingDaysAmount: number;
  unusedDaysAmount: number;
  totalAmount: number;
  currency: string;
  currencySign: string;
}

export interface ITerminationStatusFilter {
  _eq: TerminationStatus;
}

export interface ITerminationDateFilter {
  _gte?: Date;
  _lte?: Date;
}

export interface ITerminationFilter {
  status?: ITerminationStatusFilter;
  termination_date?: ITerminationDateFilter;
}
