import { DoorActionType } from '../../../graphql.schema';

export interface ISiteDoorEntity {
  id: number;
  name: string;
  description: string;
  provider_id: string;
  door_id: string;
  site_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface IOpenDoorPayload {
  provider_id: string;
  door_id: string;
}

export interface IOpenDoorResp {
  status: string;
  message: string;
}

export interface ISiteDoorHistoryEntity {
  id: number;
  site_door_id: number;
  action: DoorActionType;
  user_id: number;
  user_ip?: string;
  user_agent?: string;
  user_device?: string;
  platform?: string;
  created_at: Date;
}
