import { Inject, Injectable, Logger } from '@nestjs/common';

import { PlatformCommission } from '../../graphql.schema';
import { PLATFORM_COMMISSION_REPOSITORY } from '../../shared/constant/app.constant';
import { PlatformCommissionModel } from './commission.model';

@Injectable()
export class CommissionService {
  constructor(
    @Inject(PLATFORM_COMMISSION_REPOSITORY)
    private readonly commissionEntity: typeof PlatformCommissionModel,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(CommissionService.name);
  }

  public async getDefaultCommission(): Promise<PlatformCommission> {
    const commission = await this.commissionEntity.findOne({
      where: { slug: 'DEFAULT_COMMISSION' },
    });

    if (!commission) {
      return await this.commissionEntity.create({
        slug: 'DEFAULT_COMMISSION',
        percentage: 15,
      });
    }

    return commission;
  }
}
