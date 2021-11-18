import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import Phone from 'phone';
import { v4 as uuidv4 } from 'uuid';

import {
  LoginAdminAsUserPayload,
  LoginProvider,
  LoginResult,
  LoginWithSocialPayload,
  RefreshTokenPayload,
  SendOTPResult,
} from '../graphql.schema';
import { BadRequestError, ForbiddenError } from './../shared/errors.messages';
import { ErrorNames, getMessageT } from './../shared/lang.messages';
import { validateLanguageSync } from './../shared/validators/language.validator';
import { Auth, Platform } from './auth.decorators';
import { IByPassOTPLogin, Platform as xPlatform } from './auth.interface';
// import { Platform } from './auth.interface';
import { AuthService } from './auth.service';
import { LoginPayloadDTO } from './dto/login.dto';
import { SendOTPPayloadDTO } from './dto/send-otp.dto';
import { FacebookService } from './facebook/facebook.service';
import { GoogleService } from './google/google.service';
import { IOAuthUser } from './google/interfaces/user.interface';
import { EmailChannel } from './otp/channels/email.channel';
import { PhoneChannel } from './otp/channels/phone.channel';
import { OTPService } from './otp/otp.services';
import { RefreshTokenService } from './refresh_token/refresh-token.service';
import { UserRoles } from './users/interfaces/user.interface';
import { UserService } from './users/user.service';

@Resolver('auth')
export class AuthResolver {
  private nodeEnv: string;
  constructor(
    private readonly logger: Logger,
    private readonly otpService: OTPService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly facebookService: FacebookService,
    private readonly googleService: GoogleService,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(AuthResolver.name);
    this.nodeEnv = this.configService.get<string>('app.nodeEnv');
  }

  @Mutation('sendOTP')
  async sendOTP(
    @Args('payload') payload: SendOTPPayloadDTO,
    @Context() context,
  ): Promise<SendOTPResult> {
    const language = context?.req?.headers?.language;
    payload.username = (payload.username || '').toLowerCase();
    const provider = this.userService.getProviderFromUsername(payload.username);

    let response;
    if (provider === 'phone') {
      // by pass
      const bypassPayloads = this.getBypassOTPLogin();
      if (bypassPayloads?.username === payload.username) {
        return {
          isSent: true,
        };
      }
      // validate phone and remove 0 in start if provided
      payload.username = Phone(payload.username)?.[0] || payload.username;

      response = await this.otpService.send(
        new PhoneChannel(language),
        payload.username,
      );
    } else if (provider === 'email') {
      response = await this.otpService.send(
        new EmailChannel(language),
        payload.username,
      );
    } else {
      throw new Error('Channel not supported');
    }

    return {
      isSent: !!response,
    };
  }

  @Mutation('login')
  async login(
    @Args('payload') payload: LoginPayloadDTO,
    @Platform() platform: xPlatform,
    @Context() context,
  ): Promise<LoginResult> {
    let language = payload?.preferred_language;
    if (
      context?.req?.headers?.language &&
      language !== context?.req?.headers?.language
    ) {
      language = context?.req?.headers?.language;
    }
    if (!validateLanguageSync(language)) {
      throw BadRequestError('Input language is not supported');
    }

    const tokenId = uuidv4();

    payload.username = (payload.username || '').toLowerCase();
    // validate phone and remove 0 in start if provided
    payload.username = Phone(payload.username)?.[0] || payload.username;

    this.logger.log(payload);
    /**
     * bypass some specific username/phone for App Store review
     */
    let isByPassOTP = false;
    const bypassPayloads = this.getBypassOTPLogin();
    if (
      bypassPayloads?.username === payload.username &&
      payload.otp === bypassPayloads.otp
    ) {
      this.logger.log(`bypass case ${payload.username}`);
      isByPassOTP = true;
    }

    if (
      !isByPassOTP &&
      !(await this.otpService.isCorrect(payload.username, payload.otp))
    ) {
      throw new Error(getMessageT(ErrorNames.OTP_INVALID_EXPIRED, language));
    }

    const user = await this.userService.upsert({
      username: payload.username,
      preferred_language: payload.preferred_language,
    });

    // Delete the OTP so that it can't be used again
    await this.otpService.delete(payload.username);

    const refreshToken = await this.refreshTokenService.create(
      tokenId,
      payload?.username,
      user?.id,
      platform,
    );

    return this.authService.generateTokenInfo(
      user.id,
      user.roles,
      refreshToken,
      tokenId,
    );
  }

  @Mutation('loginWithSocial')
  async loginWithSocial(
    @Args('payload') payload: LoginWithSocialPayload,
    @Platform() platform: xPlatform,
  ): Promise<LoginResult> {
    if (!validateLanguageSync(payload?.preferred_language)) {
      throw BadRequestError('Input language is not supported');
    }

    const tokenId = uuidv4();
    let oauthUser: IOAuthUser;

    switch (payload?.type) {
      case LoginProvider.GOOGLE:
        oauthUser = await this.googleService.getUserInfo(payload?.token);
        break;
      case LoginProvider.FACEBOOK:
        oauthUser = await this.facebookService.getUserInfo(payload?.token);
    }

    const user = await this.userService.upsert({
      username: oauthUser?.email,
      oauthUser,
      preferred_language: payload.preferred_language,
    });

    const refreshToken = await this.refreshTokenService.create(
      tokenId,
      user?.email,
      user?.id,
      platform,
    );

    return this.authService.generateTokenInfo(
      user.id,
      user.roles,
      refreshToken,
      tokenId,
    );
  }

  @Mutation('refreshToken')
  async refreshToken(
    @Args('payload') payload: RefreshTokenPayload,
    @Platform() platform: xPlatform,
  ): Promise<LoginResult> {
    const tokenId = uuidv4();
    const { userId, oldTokenId } = await this.refreshTokenService.validate(
      payload?.access_token,
      payload?.refresh_token,
    );

    const user = await this.userService.findOne(userId);

    if (!user) {
      throw ForbiddenError();
    }

    const username = user?.phone_number ? user?.phone_number : user?.email;

    const refreshToken = await this.refreshTokenService.create(
      tokenId,
      username,
      userId,
      platform,
    );

    await this.refreshTokenService.delRefreshToken(oldTokenId, userId);

    return this.authService.generateTokenInfo(
      userId,
      user?.roles,
      refreshToken,
      tokenId,
    );
  }

  @Auth(UserRoles.ADMIN)
  @Mutation('loginAdminAsUser')
  async loginAdminAsUser(
    @Args('payload') payload: LoginAdminAsUserPayload,
    @Platform() platform: xPlatform,
  ): Promise<LoginResult> {
    const tokenId = uuidv4();

    this.logger.log(`loginAdminAsUser: ${JSON.stringify(payload)}`);
    const user = await this.userService.findOne(payload.user_id);
    const username = user?.email ? user?.email : user?.phone_number;

    const refreshToken = await this.refreshTokenService.create(
      tokenId,
      username,
      user?.id,
      platform,
    );

    return this.authService.generateTokenInfo(
      user.id,
      user.roles,
      refreshToken,
      tokenId,
    );
  }
  private getBypassOTPLogin(): IByPassOTPLogin {
    switch (this.nodeEnv) {
      case 'development':
        return {
          username: '+6567777777',
          otp: '111111',
        };
      case 'staging':
        return {
          username: '+6587777777',
          otp: '222222',
        };
      case 'production':
        return {
          username: '+6597777777',
          otp: '333333',
        };
    }
  }
}
