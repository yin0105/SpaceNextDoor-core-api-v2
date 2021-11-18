import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import dayJS from 'dayjs';
import { sign } from 'jsonwebtoken';

import { LoginResult, LoginTokenType } from '../graphql.schema';
import { ICreateTokenResult } from './auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly logger: Logger,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(AuthService.name);
  }

  createToken(
    userId: number,
    roles: string[],
    tokenId?: string,
  ): ICreateTokenResult {
    const expiration = this.configService.get<number>('app.jwt.expiration');
    const token = sign(
      {
        user_id: userId,
        jti: tokenId || '',
        roles,
      },
      this.configService.get('app.jwt.secret'),
      { expiresIn: `${expiration}h` },
    );

    return {
      access_token: token,
      expires_at: dayJS().add(expiration, 'h').toISOString(),
    };
  }

  generateTokenInfo(
    userId: number,
    roles: string[],
    refreshToken?: string,
    tokenId?: string,
  ): LoginResult {
    return {
      token_type: LoginTokenType.BEARER,
      refresh_token: refreshToken,
      ...this.createToken(userId, roles, tokenId),
    };
  }
}
