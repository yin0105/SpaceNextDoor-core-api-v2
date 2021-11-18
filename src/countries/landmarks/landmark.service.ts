import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

import { District, LocationLandmark } from '../../graphql.schema';
import {
  LANDMARK_REPOSITORY,
  SEQUELIZE_PROVIDER,
} from '../../shared/constant/app.constant';
import { LandmarkModel } from './landmark.model';

@Injectable()
export class LandmarkService {
  constructor(
    @Inject(SEQUELIZE_PROVIDER)
    private readonly sequelize: Sequelize,
    @Inject(LANDMARK_REPOSITORY)
    private readonly landmarkEntity: typeof LandmarkModel,
    private readonly logger: Logger,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(LandmarkService.name);
  }

  async getById(id: number): Promise<LocationLandmark> {
    const district = await this.landmarkEntity.findByPk(id);
    return (district as undefined) as LocationLandmark;
  }

  async getByDistrictId(districtId: number): Promise<District[]> {
    return this.landmarkEntity.findAll({
      where: { district_id: { [Op.eq]: districtId } },
    });
  }
}
