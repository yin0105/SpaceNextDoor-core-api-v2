export interface ICreateTokenResult {
  access_token: string;
  expires_at: string;
}

export enum Platform {
  WEB_DESKTOP = 'WEB_DESKTOP',
  WEB_MOBILE = 'WEB_MOBILE',
  IOS = 'IOS',
  ANDROID = 'ANDROID',
}

export interface IByPassOTPLogin {
  username: string;
  otp: string;
}
