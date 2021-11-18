jest.mock('./otp/channels/phone.channel.ts' as any);
import { Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';

import { LoginTokenType } from '../graphql.schema';
import { Platform } from './auth.interface';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { FacebookService } from './facebook/facebook.service';
import { GoogleService } from './google/google.service';
import { OTPService } from './otp/otp.services';
import { RefreshTokenService } from './refresh_token/refresh-token.service';
import { UserService } from './users/user.service';
describe('AuthResolver', () => {
  let resolver: AuthResolver;
  const otpService: OTPService = {
    isCorrect: jest.fn(),
    send: jest.fn(),
    delete: jest.fn(),
  } as any;
  const googleService: GoogleService = {
    getUserInfo: jest.fn(),
  } as any;
  const facebookService: FacebookService = {
    getUserInfo: jest.fn(),
  } as any;
  const userService: UserService = {
    upsert: jest.fn(),
  } as any;
  const authService: AuthService = {
    createToken: jest.fn(),
    generateTokenInfo: jest.fn(),
  } as any;
  const refreshTokenService: RefreshTokenService = {
    create: jest.fn(),
    delRefreshToken: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        AuthResolver,
        {
          provide: AuthService,
          useValue: authService,
        },
        {
          provide: GoogleService,
          useValue: googleService,
        },
        {
          provide: FacebookService,
          useValue: facebookService,
        },
        {
          provide: OTPService,
          useValue: otpService,
        },
        {
          provide: UserService,
          useValue: userService,
        },
        {
          provide: RefreshTokenService,
          useValue: refreshTokenService,
        },
        Logger,
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('login mutation', () => {
    it('should throw error if OTP is not correct', async () => {
      const spy = jest.spyOn(otpService, 'isCorrect').mockResolvedValue(false);
      const result = await resolver
        .login(
          { username: '+6684334343', otp: '232323' },
          Platform.WEB_DESKTOP,
          {},
        )
        .catch((e) => {
          expect(e.message).toContain('OTP is not correct or expired already!');
        });

      expect(result).toBeUndefined();
      expect(spy).toHaveBeenCalled();
    });

    it('should login user successfully', async () => {
      const otpSpy = jest
        .spyOn(otpService, 'isCorrect')
        .mockResolvedValue(true);
      const userSpy = jest
        .spyOn(userService, 'upsert')
        .mockResolvedValue({ id: 23, roles: [] } as any);
      const authSpy = jest
        .spyOn(authService, 'generateTokenInfo')
        .mockReturnValue({
          access_token: 'test',
          expires_at: 'date',
          refresh_token: '',
          token_type: LoginTokenType.BEARER,
        } as any);
      const result = await resolver.login(
        {
          username: '+6684334343',
          otp: '232323',
        },
        Platform.WEB_DESKTOP,
        {},
      );

      expect(result).toEqual({
        access_token: 'test',
        expires_at: 'date',
        refresh_token: '',
        token_type: LoginTokenType.BEARER,
      });
      expect(otpSpy).toHaveBeenCalled();
      expect(userSpy).toHaveBeenCalled();
      expect(authSpy).toHaveBeenCalled();
    });
  });
});
