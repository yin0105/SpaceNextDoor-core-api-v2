import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

import { District } from '../../graphql.schema';
import {
  DISTRICT_REPOSITORY,
  SEQUELIZE_PROVIDER,
} from '../../shared/constant/app.constant';
import { DistrictModel } from './district.model';

@Injectable()
export class DistrictService {
  constructor(
    @Inject(SEQUELIZE_PROVIDER)
    private readonly sequelize: Sequelize,
    @Inject(DISTRICT_REPOSITORY)
    private readonly districtEntity: typeof DistrictModel,
    private readonly logger: Logger,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(DistrictService.name);
  }

  async getById(id: number): Promise<District> {
    const district = await this.districtEntity.findByPk(id);
    return (district as undefined) as District;
  }

  async getByCityId(cityId: number): Promise<District[]> {
    return await this.districtEntity.findAll({
      where: { city_id: { [Op.eq]: cityId } },
    });
  }
}
