import { IOAuthUser } from '../../google/interfaces/user.interface';

export interface IUpsertUserPayload {
  username: string;
  oauthUser?: IOAuthUser;
  preferred_language?: string;
}
