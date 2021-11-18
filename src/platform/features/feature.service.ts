import { Inject, Injectable, Logger } from '@nestjs/common';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

import { PlatformFeature, PlatformFeatureType } from '../../graphql.schema';
import {
  PLATFORM_FEATURE_REPOSITORY,
  SEQUELIZE_PROVIDER,
} from './../../shared/constant/app.constant';
import { PlatformFeatureModel } from './feature.model';

@Injectable()
export class PlatformFeatureService {
  constructor(
    @Inject(SEQUELIZE_PROVIDER)
    private readonly sequelize: Sequelize,
    @Inject(PLATFORM_FEATURE_REPOSITORY)
    private readonly featureEntity: typeof PlatformFeatureModel,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(PlatformFeatureService.name);
  }

  async getByIds(ids: number[]): Promise<PlatformFeature[]> {
    const features = await this.featureEntity.findAll({
      where: {
        id: { [Op.in]: ids },
      },
    });

    return (features as undefined) as PlatformFeature[];
  }

  async getByCatId(id: number): Promise<PlatformFeature[]> {
    const features = await this.featureEntity.findAll({
      where: {
        category_id: { [Op.eq]: id },
      },
    });

    return (features as undefined) as PlatformFeature[];
  }

  async getByType(type: PlatformFeatureType): Promise<PlatformFeature[]> {
    const features = await this.featureEntity.findAll({
      where: {
        type,
      },
    });

    return (features as undefined) as PlatformFeature[];
  }
}
