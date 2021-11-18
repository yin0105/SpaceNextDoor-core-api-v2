import { Inject, Injectable, Logger } from '@nestjs/common';
import { Transaction } from 'sequelize';

import { CityModel } from '../../countries/cities/city.model';
import { CountryModel } from '../../countries/country.model';
import { DistrictModel } from '../../countries/districts/district.model';
import {
  BookingSiteAddress,
  BookingSiteAddressPayload,
} from '../../graphql.schema';
import { BOOKING_SITE_ADDRESS_REPOSITORY } from '../../shared/constant/app.constant';
import { BookingSiteAddressModel } from './booking-site-address.model';

@Injectable()
export class BookingSiteAddressService {
  constructor(
    @Inject(BOOKING_SITE_ADDRESS_REPOSITORY)
    private readonly bookingSiteAddressEntity: typeof BookingSiteAddressModel,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(BookingSiteAddressService.name);
  }

  async getById(id: number): Promise<BookingSiteAddress> {
    const address = await this.bookingSiteAddressEntity.findByPk(id, {
      include: [
        { model: CountryModel },
        { model: CityModel },
        { model: DistrictModel },
      ],
    });

    return (address as undefined) as BookingSiteAddress;
  }

  async create(
    payload: BookingSiteAddressPayload,
    args?: { t: Transaction },
  ): Promise<BookingSiteAddressModel> {
    return await this.bookingSiteAddressEntity.create(payload, {
      transaction: args?.t,
    });
  }
}
