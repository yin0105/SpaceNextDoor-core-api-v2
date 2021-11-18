import { Logger } from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import {
  City,
  CountriesFilter,
  CountriesResp,
  LocationFilter,
  LocationsResp,
  LocationsSort,
  Pagination,
  SortBy,
} from '../graphql.schema';
import { CityService } from './cities/city.service';
import { CountryService } from './country.service';
import { ICountryEntity } from './interfaces/country.interface';

@Resolver('Country')
export class CountryResolver {
  constructor(
    private readonly countryService: CountryService,
    private readonly cityService: CityService,
    private readonly logger: Logger,
  ) {}

  @Query('countries')
  async getSites(
    @Args('pagination') pagination: Pagination,
    @Args('where') where?: CountriesFilter,
  ): Promise<CountriesResp> {
    return this.countryService.countries(pagination, where);
  }

  @Query('locations')
  async locations(
    @Args('where') where: LocationFilter,
    @Args('sort_by') sortBy: LocationsSort = { name: SortBy.asc },
  ): Promise<LocationsResp> {
    return this.countryService.searchLocations(sortBy, where);
  }

  @ResolveField('cities')
  async cities(@Parent() country: ICountryEntity): Promise<City[]> {
    return this.cityService.getByCountryId(country.id);
  }
}
