import { Inject, Injectable, Logger } from '@nestjs/common';
import { Op, Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

import {
  SEQUELIZE_PROVIDER,
  SITE_POLICY_REPOSITORY,
} from './../../shared/constant/app.constant';
import { SitePolicyModel } from './site-policy.model';

@Injectable()
export class SitePolicyService {
  constructor(
    @Inject(SEQUELIZE_PROVIDER)
    private readonly sequelize: Sequelize,
    @Inject(SITE_POLICY_REPOSITORY)
    private readonly sitePolicyEntity: typeof SitePolicyModel,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(SitePolicyService.name);
  }

  /**
   * Create / Delete site policy entires
   */
  async upsert(
    siteId: number,
    policyIds: number[],
    t?: Transaction,
  ): Promise<any> {
    try {
      const siteRules = await this.sitePolicyEntity.findAll({
        where: { site_id: { [Op.eq]: siteId } },
      });

      const promises = [];
      policyIds.forEach((policyId) => {
        if (!siteRules.find((siteRule) => siteRule.policy_id === policyId)) {
          promises.push(
            this.sitePolicyEntity.create(
              { site_id: siteId, policy_id: policyId },
              { transaction: t },
            ),
          );
        }
      });

      promises.push(
        this.sitePolicyEntity.destroy({
          where: {
            site_id: { [Op.eq]: siteId },
            policy_id: { [Op.notIn]: policyIds },
          },
          transaction: t,
        }),
      );

      return await Promise.all(promises);
    } catch (error) {
      this.logger.error('Upsert Site-Policy Error: ', error?.stack);

      throw error;
    }
  }
}
