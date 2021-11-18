import { Logger } from '@nestjs/common';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { CityService } from '../../countries/cities/city.service';
import { CountryService } from '../../countries/country.service';
import { DistrictService } from '../../countries/districts/district.service';
import { City, Country, District } from '../../graphql.schema';
import { BookingSiteAddressModel } from './booking-site-address.model';
import { IBookingSiteAddressEntity } from './interfaces/booking-site-address.interface';

@Resolver('BookingSiteAddress')
export class BookingSiteAddressResolver {
  constructor(
    private readonly countryService: CountryService,
    private readonly cityService: CityService,
    private readonly districtService: DistrictService,
    private readonly logger: Logger,
  ) {}

  @ResolveField('country')
  async country(
    @Parent() address: IBookingSiteAddressEntity,
  ): Promise<Country> {
    if (!address.country_id) {
      return null;
    }

    return await this.countryService.getById(address.country_id);
  }

  @ResolveField('city')
  async city(@Parent() address: BookingSiteAddressModel): Promise<City> {
    if (!address.city_id) {
      return null;
    }

    return await this.cityService.getById(address.city_id);
  }

  @ResolveField('district')
  async district(
    @Parent() address: BookingSiteAddressModel,
  ): Promise<District> {
    if (!address.district_id) {
      return null;
    }

    return await this.districtService.getById(address.district_id);
  }
}
