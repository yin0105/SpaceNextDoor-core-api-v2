import { Inject, Injectable, Logger } from '@nestjs/common';
import { Op, Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

import {
  SEQUELIZE_PROVIDER,
  SITE_FEATURE_REPOSITORY,
} from './../../shared/constant/app.constant';
import { SiteFeatureModel } from './site-feature.model';

@Injectable()
export class SiteFeatureService {
  constructor(
    @Inject(SEQUELIZE_PROVIDER)
    private readonly sequelize: Sequelize,
    @Inject(SITE_FEATURE_REPOSITORY)
    private readonly siteFeatureEntity: typeof SiteFeatureModel,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(SiteFeatureService.name);
  }

  /**
   * Create / Delete site feature entires
   */
  async upsert(
    siteId: number,
    featureIds: number[],
    t?: Transaction,
  ): Promise<any> {
    try {
      const siteFeatures = await this.siteFeatureEntity.findAll({
        where: { site_id: { [Op.eq]: siteId } },
      });

      const promises = [];
      featureIds.forEach((featId) => {
        if (
          !siteFeatures.find((siteFeature) => siteFeature.feature_id === featId)
        ) {
          promises.push(
            this.siteFeatureEntity.create(
              { site_id: siteId, feature_id: featId },
              { transaction: t },
            ),
          );
        }
      });

      promises.push(
        this.siteFeatureEntity.destroy({
          where: {
            site_id: { [Op.eq]: siteId },
            feature_id: { [Op.notIn]: featureIds },
          },
          transaction: t,
        }),
      );

      return await Promise.all(promises);
    } catch (error) {
      this.logger.error('Upsert Site-Feature Error: ', error?.stack);

      throw error;
    }
  }
}
