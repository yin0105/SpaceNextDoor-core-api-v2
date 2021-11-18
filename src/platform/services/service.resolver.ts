import { Logger } from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { CountryService } from '../../countries/country.service';
import {
  Country,
  Pagination,
  ServiceFilter,
  ServicesResp,
} from '../../graphql.schema';
import { IPlatformServiceEntity } from './interfaces/service.interface';
import { Service } from './service';

@Resolver('PlatformService')
export class ServiceResolver {
  constructor(
    private readonly service: Service,
    private readonly countryService: CountryService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(ServiceResolver.name);
  }

  @Query('services')
  async services(
    @Args('pagination') pagination: Pagination,
    @Args('where') where: ServiceFilter,
  ): Promise<ServicesResp> {
    return await this.service.findAll(pagination, where);
  }

  @ResolveField('country')
  async country(@Parent() service: IPlatformServiceEntity): Promise<Country> {
    return this.countryService.getById(service?.country_id);
  }
}
