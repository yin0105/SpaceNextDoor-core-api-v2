import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import to from 'await-to-js';
import * as bcrypt from 'bcrypt';
import crypto from 'crypto';
import dayjs from 'dayjs';
import { verify as verifyJWT } from 'jsonwebtoken';

import {
  ForbiddenError,
  InternalServerError,
} from '../../shared/errors.messages';
import { REFRESH_TOKEN_REPOSITORY } from './../../shared/constant/app.constant';
import { Platform } from './../auth.interface';
import { IRefreshTokenEntity } from './interfaces/refresh-token.interface';
import { RefreshTokenModel } from './refresh-token.model';

@Injectable()
export class RefreshTokenService {
  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenEntity: typeof RefreshTokenModel,
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(RefreshTokenService.name);
  }

  public async validate(
    accessToken: string,
    refreshToken: string,
  ): Promise<{ userId: number; oldTokenId: string }> {
    try {
      const decodedToken = verifyJWT(
        accessToken,
        this.configService.get('app.jwt.secret'),
      ) as any;

      const authRefreshToken = await this.refreshTokenEntity.findOne({
        where: {
          token_id: decodedToken?.jti,
        },
      });

      if (!authRefreshToken) {
        throw ForbiddenError('UnAuthorized');
      }

      await this.isValidRefreshToken(
        refreshToken,
        authRefreshToken?.refresh_token_hash,
      );

      return {
        userId: authRefreshToken?.user_id,
        oldTokenId: authRefreshToken?.token_id,
      };
    } catch (e) {
      throw ForbiddenError('UnAuthorized');
    }
  }

  async isValidRefreshToken(
    refreshToken: string,
    refreshTokenHash: string,
  ): Promise<void> {
    const [isValidRefreshTokenErr, isValidRefreshToken] = await to(
      bcrypt.compare(refreshToken, refreshTokenHash),
    );
    if (isValidRefreshTokenErr || !isValidRefreshToken) {
      throw InternalServerError('Something went wrong');
    }
  }

  public async create(
    tokenId: string,
    username: string,
    userId: number,
    platform: Platform,
  ): Promise<string> {
    const refreshToken = this.generateRefreshToken(username);
    await this.saveRefreshToken(tokenId, refreshToken, userId, platform);
    return refreshToken;
  }

  async saveRefreshToken(
    tokenId: string,
    refreshToken: string,
    userId: number,
    platform: Platform,
  ): Promise<void> {
    type CreateRefreshTokenPayload = Omit<
      IRefreshTokenEntity,
      'id' | 'created_at' | 'updated_at'
    >;
    // delete the existing session with the same platform if found any because we are only gonna keep one session per platform with the same user
    const [delRefreshTokenErr] = await to(
      this.refreshTokenEntity.destroy({
        where: {
          user_id: userId,
          platform,
        },
      }),
    );

    if (delRefreshTokenErr) {
      throw InternalServerError('Something went wrong.');
    }

    const [refreshTokenHashErr, refreshTokenHash] = await to(
      bcrypt.hash(refreshToken, 10),
    );

    if (refreshTokenHashErr) {
      this.logger.log(
        'Something went wrong while creating hash of refresh token.',
      );
      throw InternalServerError('Something went wrong.');
    }

    const refreshTokenExpireDays = this.configService.get(
      'app.refreshTokenExpiration',
    );
    const refreshTokenExpireDate = dayjs().add(
      parseInt(refreshTokenExpireDays, 10),
      'day',
    );
    // refreshTokenExpireDate.setDate(
    //   refreshTokenExpireDate.getDate() + parseInt(refreshTokenExpireDays, 10),
    // );

    const refreshTokenPayload: CreateRefreshTokenPayload = {
      token_id: tokenId,
      refresh_token_hash: refreshTokenHash.toString(),
      user_id: userId,
      refresh_token_expires_at: refreshTokenExpireDate.toDate(),
      platform,
    };

    const [createRefreshTokenErr] = await to(
      this.refreshTokenEntity.create(refreshTokenPayload),
    );

    if (createRefreshTokenErr) {
      this.logger.log(createRefreshTokenErr);
      this.logger.log(
        `Something went wrong while saving refresh token ---> refresh token: ${refreshToken}, user id: ${userId}`,
      );
      throw InternalServerError('Something went wrong.');
    }
  }

  public async delRefreshToken(tokenId: string, userId: number): Promise<void> {
    await this.refreshTokenEntity.destroy({
      where: {
        token_id: tokenId,
        user_id: userId,
      },
    });
  }

  generateRefreshToken(username: string): string {
    const hash = crypto.createHash('sha1');
    return hash.update(`${username}.${new Date().toISOString()}`).digest('hex');
  }
}
