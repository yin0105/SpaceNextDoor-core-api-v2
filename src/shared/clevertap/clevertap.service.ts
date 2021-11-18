import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import CleverTap from 'clevertap';

@Injectable()
export class ClevertapService {
  private readonly accountId;
  private readonly accountPasscode;
  private readonly cleverTap;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: Logger,
  ) {
    this.accountId = this.config.get('app.clevertap.accountId');
    this.accountPasscode = this.config.get('app.clevertap.accountPasscode');
    this.cleverTap = CleverTap.init(this.accountId, this.accountPasscode);
  }

  public async pushEvents(data: any) {
    return this.cleverTap.upload(data, { debug: 1, batchSize: 1000 }, (res) => {
      this.logger.log('Service cleverTap', res);
    });
  }
}
