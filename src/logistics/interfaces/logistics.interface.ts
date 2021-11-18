import { LogisticsPriceResp } from '../../graphql.schema';

export interface ILogisticsDestination {
  lat: number;
  lng: number;
}

export interface ILogisticsPickUp {
  schedule_at: Date;
  lat: number;
  lng: number;
}

export interface ILogisticsAdditionalRequirements {
  mover_count?: number;
}

export interface ILogisticsCreateOrderResp {
  order_id: string;
  amount: number;
}

interface ILocationPoint {
  name: string;
  street_address: string;
  floor_or_unit_number?: string;
  location: {
    lat: number;
    lng: number;
  };
  contact: {
    name: string;
    phone_number: string;
  };
}

export interface ILogisticsCreateOrderPayload {
  scheduledAt: Date;
  vehicle: string;
  customer: {
    name: string;
    phone: string;
    location: ILogisticsDestination;
    address: string;
  };
  site: {
    name: string;
    phone: string;
    location: ILogisticsDestination;
    address: string;
    floor: string;
  };
  extraRequirements?: ILogisticsAdditionalRequirements;
}

export interface ILogistics {
  getVehicleType(spaceType: string): string;
  createOrder(
    pickup: ILocationPoint,
    dropOff: ILocationPoint,
    scheduledAt: Date,
    vehicle: string,
    extraRequirements?: ILogisticsAdditionalRequirements,
  ): Promise<ILogisticsCreateOrderResp>;
  cancelOrder(orderId: string): Promise<boolean>;
  vehicleTypeValidate(spaceType: string, vehicleCode: string): boolean;
  getPrice(
    pickUp: ILogisticsPickUp,
    destination: ILogisticsDestination,
    additionalRequirements: ILogisticsAdditionalRequirements,
    vehicle: string,
  ): Promise<LogisticsPriceResp>;
}

export enum SpaceType {
  XXS = 'XXS',
  XS = 'XS',
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
  XXL = 'XXL',
}
