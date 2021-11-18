import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

import { City } from '../../graphql.schema';
import {
  CITY_REPOSITORY,
  SEQUELIZE_PROVIDER,
} from '../../shared/constant/app.constant';
import { CityModel } from './city.model';

@Injectable()
export class CityService {
  constructor(
    @Inject(SEQUELIZE_PROVIDER)
    private readonly sequelize: Sequelize,
    @Inject(CITY_REPOSITORY)
    private readonly cityEntity: typeof CityModel,
    private readonly logger: Logger,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(CityService.name);
  }

  async getById(id: number): Promise<City> {
    const city = await this.cityEntity.findByPk(id);
    return (city as undefined) as City;
  }

  async getByCountryId(countryId: number): Promise<City[]> {
    return await this.cityEntity.findAll({
      where: { country_id: { [Op.eq]: countryId } },
    });
  }
}
