import { ILogisticsAdditionalRequirements } from '../../../interfaces/logistics.interface';

export enum GoGoxVehicleType {
  VAN = 'van',
  LORRY10 = 'lorry10',
  LORRY14 = 'lorry14',
  LORRY24 = 'lorry24',
}

export enum GoGoxOrderStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export interface IGogoxPricePayload {
  vehicle_type: string;
  pickup: {
    location: {
      lat: number;
      lng: number;
    };
    schedule_at: number;
  };
  destinations: [{ location: { lat: number; lng: number } }];
  extra_requirements: ILogisticsAdditionalRequirements;
}

export interface IGogoxPriceResp {
  vehicle_type: any;
  estimated_price: { amount: number; currency: string };
  estimated_price_breakdown: [
    { key: string; amount: number; quantity: number },
  ];
}

export interface ILocationPoint {
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

export interface IGogoxOrderPayload {
  payment_method: 'prepaid_wallet' | 'monthly_settlement';
  vehicle_type: GoGoxVehicleType;
  pickup: ILocationPoint & { schedule_at: number };
  destinations: ILocationPoint[];
  note_to_courier?: string;
  extra_requirements?: ILogisticsAdditionalRequirements;
}

export interface IGogoxOrderResp {
  id: string;
  uuid: string;
  price: {
    amount: number;
  };
  courier: {
    name: string;
    phone_number: string;
  };
  status: GoGoxOrderStatus;
}
export type GogoxVehicleCapacity = {
  [key in GoGoxVehicleType]: string[];
};
