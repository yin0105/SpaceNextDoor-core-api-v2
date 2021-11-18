import { FixedCountry, SpaceSizeUnit } from '../../graphql.schema';

export interface ISiteLinkSite {
  SiteName: string;
  SiteId: number;
}

export interface ISiteLinkUnit {
  UnitId: number;
  UnitName: string;
  UnitDescription: string;
  DaysEmpty: number;
  Floor: number;
  HasClimate: boolean;
  HasPower: boolean;
  IsInside: boolean;
  HasAlarm: boolean;
  WeeklyRate: number;
  MonthlyRate: number;
  StandardRate: number;
  WebRate: number;
  ExcludeFromRevenueMgmt: boolean;
  PushRate: number;
  StandardLateFee: number;
  DoorTypeId: number;
  EntryLocation: number;
  UnitNote: string;
  DefaultLeaseNumber: number;
  WaitingUnitID: number;
  StdSecDep: number;
  CanChargeTax1: true;
  CanChargeTax2: true;
  IsRented: boolean;
  IsServiceRequired: boolean;
  IsRentable: boolean;
  IsExcludedFromInsurance: boolean;
  IsInsuranceRequired: boolean;
  DefaultUnitId: number;
  TotalUnits: number;
  TotalOccupied: number;
  TotalVacant: number;
  TotalReserved: number;
  DefaultCoverageId: number;
  UnitTypeId: number;
  TypeName: string;
  Area: number;
  Width: number;
  Length: number;
  Size: string;
  Count: number;
}

export interface ISiteLinkByStore {
  country: FixedCountry;
  store_name: SiteLinkStore;
  unit_type: SpaceSizeUnit;
  currency?: string;
  currency_sign?: string;
}

export enum SiteLinkStore {
  STOREHUB = 'STOREHUB',
  JWD_STORE_IT = 'JWD_STORE_IT',
}
