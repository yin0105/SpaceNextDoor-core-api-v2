import { Platform } from '../../auth.interface';
export interface IRefreshTokenEntity {
  id: number;
  user_id: number;
  token_id: string;
  refresh_token_hash: string;
  refresh_token_expires_at: Date;
  platform: Platform;
  created_at: Date;
  updated_at: Date;
}
