import { REFRESH_TOKEN_REPOSITORY } from '../../shared/constant/app.constant';
import { RefreshTokenModel } from './refresh-token.model';

export const refreshTokenProvider = [
  {
    provide: REFRESH_TOKEN_REPOSITORY,
    useValue: RefreshTokenModel,
  },
];
