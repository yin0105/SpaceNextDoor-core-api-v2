import { Logger } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { Auth, AuthUser, IAuthUser } from '../../auth/auth.decorators';
import { UserRoles } from '../../auth/users/interfaces/user.interface';
import {
  OpenSiteDoorResp,
  OpenSiteDoorWhere,
  Pagination,
  SiteDoorsFilter,
  SiteDoorsResp,
  SiteDoorsSort,
} from '../../graphql.schema';
import { SiteDoorService } from './site-door.service';
import { CurrentUserIp } from './site-doors-history/history.decorator';

@Resolver('SiteDoor')
export class SiteDoorResolver {
  constructor(
    private readonly siteDoorService: SiteDoorService,
    private readonly logger: Logger,
  ) {}

  @Auth(UserRoles.CUSTOMER)
  @Query('site_doors')
  async siteDoors(
    @AuthUser() user: IAuthUser,
    @Args('pagination') pagination: Pagination,
    @Args('where') where?: SiteDoorsFilter,
    @Args('sort') sort?: SiteDoorsSort,
  ): Promise<SiteDoorsResp> {
    return await this.siteDoorService.listDoors(
      user.user_id,
      pagination,
      where,
      sort,
    );
  }

  @Auth(UserRoles.CUSTOMER)
  @Mutation('openSiteDoor')
  async openSiteDoor(
    @AuthUser() user: IAuthUser,
    @Args('where') payload: OpenSiteDoorWhere,
    @CurrentUserIp() user_ip: string,
  ): Promise<OpenSiteDoorResp> {
    return await this.siteDoorService.openDoor(payload, user.user_id, user_ip);
  }
}
