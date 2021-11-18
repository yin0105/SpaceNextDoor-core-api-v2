import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Op, Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

import { CityModel } from '../../countries/cities/city.model';
import { CountryModel } from '../../countries/country.model';
import { DistrictModel } from '../../countries/districts/district.model';
import { SiteAddress, SiteAddressPayload } from '../../graphql.schema';
import {
  SEQUELIZE_PROVIDER,
  SITE_ADDRESS_REPOSITORY,
} from '../../shared/constant/app.constant';
import { SiteAddressModel } from './site-address.model';

@Injectable()
export class SiteAddressService {
  constructor(
    @Inject(SEQUELIZE_PROVIDER)
    private readonly sequelize: Sequelize,
    @Inject(SITE_ADDRESS_REPOSITORY)
    private readonly addressEntity: typeof SiteAddressModel,
    private readonly logger: Logger,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(SiteAddressService.name);
  }

  async getById(id: number): Promise<SiteAddress> {
    const address = await this.addressEntity.findByPk(id, {
      include: [
        { model: CountryModel },
        { model: CityModel },
        { model: DistrictModel },
      ],
    });

    return (address as undefined) as SiteAddress;
  }

  async upsert(
    id: number,
    payload: SiteAddressPayload,
    args?: { t: Transaction },
  ): Promise<SiteAddressModel> {
    if (id) {
      if (payload.lat && payload.lng) {
        (payload as any).point = {
          coordinates: [payload.lng, payload.lat],
          type: 'Point',
        };
      }

      await this.addressEntity.update(payload, {
        where: { id: { [Op.eq]: id } },
        transaction: args.t,
      });
    }

    (payload as any).point = {
      coordinates: [payload.lng, payload.lat],
      type: 'Point',
    };

    return this.addressEntity.create(payload, {
      transaction: args?.t,
    });
  }
}
