import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { config } from 'dotenv';
import { Strategy, VerifyCallback } from 'passport-facebook';

import {
  IFacebookUser,
  IOAuthUser,
  IProvider,
} from './interfaces/user.interface';

config();

@Injectable()
export class FacebookStrategyKr extends PassportStrategy(
  Strategy,
  'facebookKR',
) {
  constructor() {
    super({
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: `${process.env.FACEBOOK_CALLBACK_URL}/kr`,
      profileFields: [
        'id',
        'displayName',
        'name',
        'profileUrl',
        'photos',
        'emails',
      ],
      scope: ['email'], // must mention in order to access user's fb email
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: IFacebookUser,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;
    const user: IOAuthUser = {
      id,
      provider: IProvider.FACEBOOK,
      email: emails[0]?.value || null,
      email_verified: emails[0].verified,
      first_name: name?.givenName || '',
      last_name: name?.familyName || '',
      picture: photos[0]?.value || null,
    };

    done(null, user);
  }
}
