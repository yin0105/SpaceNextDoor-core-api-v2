import { Logger } from '@nestjs/common';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { District } from '../../graphql.schema';
import { DistrictService } from '../districts/district.service';
import { ICityEntity } from './../interfaces/country.interface';

@Resolver('City')
export class CityResolver {
  constructor(
    private readonly districtService: DistrictService,
    private readonly logger: Logger,
  ) {}

  @ResolveField('districts')
  async districts(@Parent() city: ICityEntity): Promise<District[]> {
    return await this.districtService.getByCityId(city.id);
  }
}
