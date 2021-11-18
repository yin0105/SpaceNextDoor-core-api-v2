import { Logger } from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { CountryService } from '../../countries/country.service';
import {
  Country,
  InsuranceFilter,
  InsuranceSort,
  InsurancesResp,
  Pagination,
  SortBy,
} from '../../graphql.schema';
import { InsuranceService } from './insurance.service';
import { IPlatformInsuranceEntity } from './interfaces/insurance.interface';

@Resolver('PlatformInsurance')
export class InsuranceResolver {
  constructor(
    private readonly insuranceService: InsuranceService,
    private readonly countryService: CountryService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(InsuranceResolver.name);
  }

  @Query('insurances')
  async insurances(
    @Args('pagination') pagination: Pagination,
    @Args('sort_by') sortBy: InsuranceSort = { covered_amount: SortBy.asc },
    @Args('where') where: InsuranceFilter,
  ): Promise<InsurancesResp> {
    return await this.insuranceService.findAll(pagination, sortBy, where);
  }

  @ResolveField('country')
  async country(
    @Parent() insurance: IPlatformInsuranceEntity,
  ): Promise<Country> {
    return this.countryService.getById(insurance?.country_id);
  }
}
