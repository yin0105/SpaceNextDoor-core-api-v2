import { Inject, Injectable, Logger } from '@nestjs/common';
import { Op, Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

import {
  SEQUELIZE_PROVIDER,
  SITE_RULE_REPOSITORY,
} from './../../shared/constant/app.constant';
import { SiteRuleModel } from './site-rule.model';

@Injectable()
export class SiteRuleService {
  constructor(
    @Inject(SEQUELIZE_PROVIDER)
    private readonly sequelize: Sequelize,
    @Inject(SITE_RULE_REPOSITORY)
    private readonly siteRuleEntity: typeof SiteRuleModel,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(SiteRuleService.name);
  }

  /**
   * Create / Delete site rule entires
   */
  async upsert(
    siteId: number,
    ruleIds: number[],
    t?: Transaction,
  ): Promise<any> {
    try {
      const siteRules = await this.siteRuleEntity.findAll({
        where: { site_id: { [Op.eq]: siteId } },
      });

      const promises = [];
      ruleIds.forEach((ruleId) => {
        if (!siteRules.find((siteRule) => siteRule.rule_id === ruleId)) {
          promises.push(
            this.siteRuleEntity.create(
              { site_id: siteId, rule_id: ruleId },
              { transaction: t },
            ),
          );
        }
      });

      promises.push(
        this.siteRuleEntity.destroy({
          where: {
            site_id: { [Op.eq]: siteId },
            rule_id: { [Op.notIn]: ruleIds },
          },
          transaction: t,
        }),
      );

      return await Promise.all(promises);
    } catch (error) {
      this.logger.error('Upsert Site-Rule Error: ', error?.stack);

      throw error;
    }
  }
}
