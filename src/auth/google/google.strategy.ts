import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { config } from 'dotenv';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

import {
  IGoogleUser,
  IOAuthUser,
  IProvider,
} from './interfaces/user.interface';

config();

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: IGoogleUser,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;
    const user: IOAuthUser = {
      id,
      provider: IProvider.GOOGLE,
      email: emails[0].value,
      email_verified: emails[0].verified,
      first_name: name.givenName,
      last_name: name.familyName,
      picture: photos[0].value,
    };
    done(null, user);
  }
}
