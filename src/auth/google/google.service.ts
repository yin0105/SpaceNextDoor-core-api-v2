import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

import { IOAuthUser, IProvider } from './interfaces/user.interface';
@Injectable()
export class GoogleService {
  constructor(private readonly logger: Logger) {
    this.logger.setContext(GoogleService.name);
  }

  public async getUserInfo(accessToken: string): Promise<IOAuthUser> {
    const { data } = await axios({
      url: 'https://www.googleapis.com/oauth2/v2/userinfo',
      method: 'get',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return {
      id: data?.id,
      provider: IProvider.GOOGLE,
      email: data?.email,
      email_verified: data?.verified_email,
      first_name: data?.given_name || '',
      last_name: data?.family_name || '',
      picture: data?.picture || '',
    };
  }
}
