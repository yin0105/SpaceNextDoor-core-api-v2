import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

import { IOAuthUser, IProvider } from '../google/interfaces/user.interface';

@Injectable()
export class FacebookService {
  constructor(private readonly logger: Logger) {
    this.logger.setContext(FacebookService.name);
  }

  public async getUserInfo(accessToken: string): Promise<IOAuthUser> {
    // eslint-disable-next-line no-restricted-syntax
    console.log('FB accessToken: ', accessToken);
    const { data } = await axios({
      url: 'https://graph.facebook.com/me',
      method: 'get',
      params: {
        fields: ['id', 'email', 'first_name', 'last_name'].join(','),
        access_token: accessToken,
      },
    });

    return {
      id: data?.id,
      provider: IProvider.FACEBOOK,
      email: data?.email,
      email_verified: true,
      first_name: data?.first_name || '',
      last_name: data?.last_name || '',
      picture: `https://graph.facebook.com/${data.id}/picture?type=large`,
    };
  }
}
