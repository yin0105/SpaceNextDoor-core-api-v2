import { Inject, Injectable, Logger } from '@nestjs/common';
import { Op, Transaction } from 'sequelize';

import { PlatformFeature } from '../../graphql.schema';
import { PlatformFeatureCategoryModel } from '../../platform/features/categories/feature-category.model';
import { PlatformFeatureModel } from '../../platform/features/feature.model';
import { SPACE_FEATURE_REPOSITORY } from './../../shared/constant/app.constant';
import { SpaceFeatureModel } from './space-feature.model';

@Injectable()
export class SpaceFeatureService {
  constructor(
    @Inject(SPACE_FEATURE_REPOSITORY)
    private readonly spaceFeatureEntity: typeof SpaceFeatureModel,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(SpaceFeatureService.name);
  }

  /**
   * Create / Delete space feature entires
   */
  async upsert(
    spaceId: number,
    featureIds: number[],
    options?: {
      t?: Transaction;
    },
  ): Promise<any> {
    try {
      const promises = [];
      const spaceFeatures = await this.spaceFeatureEntity.findAll({
        where: { space_id: { [Op.eq]: spaceId } },
      });
      const spaceFeaturePromises = featureIds
        .filter(
          (featureId) =>
            !spaceFeatures.find(
              (spaceFeature) => spaceFeature.feature_id === featureId,
            ),
        )
        .map((featureId) =>
          this.spaceFeatureEntity.create(
            {
              space_id: spaceId,
              feature_id: featureId,
            },
            { transaction: options?.t },
          ),
        );
      promises.push(spaceFeaturePromises);
      promises.push(
        this.spaceFeatureEntity.destroy({
          where: {
            space_id: { [Op.eq]: spaceId },
            feature_id: { [Op.notIn]: featureIds },
          },
          transaction: options?.t,
        }),
      );

      return await Promise.all(promises);
    } catch (error) {
      this.logger.error('Upsert Space-Feature Error: ', error?.stack);

      throw error;
    }
  }
  async getBySpaceId(id: number): Promise<PlatformFeature[]> {
    const spaceFeatures = await this.spaceFeatureEntity.findAll({
      include: [
        {
          model: PlatformFeatureModel,
          include: [
            {
              model: PlatformFeatureCategoryModel,
            },
          ],
        },
      ],
      where: {
        space_id: { [Op.eq]: id },
      },
    });
    return (spaceFeatures.map(
      (spaceFeature) => spaceFeature.feature,
    ) as undefined) as PlatformFeature[];
  }
}
