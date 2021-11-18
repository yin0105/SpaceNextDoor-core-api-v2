/* eslint-disable complexity */
import { Inject, Logger } from '@nestjs/common';
import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import {
  Auth,
  AuthOptional,
  AuthUser,
  IAuthUser,
} from '../../auth/auth.decorators';
import { UserRoles } from '../../auth/users/interfaces/user.interface';
import {
  DeleteSpaceFilter,
  DeleteSpaceResp,
  Pagination,
  PlatformFeature,
  PlatformSpaceType,
  Quotation,
  Site,
  Space,
  SpacePayload,
  SpacePrice,
  SpacesFilter,
  SpacesResp,
  SpacesSort,
  SpaceStatus,
  StockManagementType,
  UpdateSpaceFilter,
  UpdateSpacePayload,
  UpdateSpaceResp,
} from '../../graphql.schema';
import { PlatformSpaceTypeService } from '../../platform/space-types/space-type.service';
import { QuotationService } from '../../quotations/quotation.service';
import { SPACE_REPOSITORY } from '../../shared/constant/app.constant';
import { ForbiddenError, NotFoundError } from '../../shared/errors.messages';
import { SiteService } from '../../sites/sites/site.service';
import { PriceService } from '../prices/price.service';
import { SpaceFeatureService } from '../space-features/space-feature.service';
import { ISpaceEntity } from './interfaces/space.interface';
import { SpaceModel } from './space.model';
import { SpaceService } from './space.service';

@Resolver('Space')
export class SpaceResolver {
  constructor(
    private readonly spaceService: SpaceService,
    private readonly siteService: SiteService,
    private readonly priceService: PriceService,
    private readonly platformSpaceTypeService: PlatformSpaceTypeService,
    private readonly spaceFeatureService: SpaceFeatureService,
    private readonly quotationService: QuotationService,
    @Inject(SPACE_REPOSITORY)
    private readonly spaceEntity: typeof SpaceModel,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(SpaceResolver.name);
  }
  @Auth(UserRoles.PROVIDER, UserRoles.ADMIN)
  @Mutation('createSpace')
  async createSpace(
    @Args('payload') payload: SpacePayload,
    @AuthUser() user: IAuthUser,
  ): Promise<Space> {
    const options = {
      user_id: user.user_id,
      roles: user.roles,
      isAdmin: user.hasRole(UserRoles.ADMIN),
      isHost: user.hasRole(UserRoles.PROVIDER),
    };
    // validate payload
    await this.spaceService.validateSpacePayload(payload);

    return this.spaceService.create(payload, options);
  }

  @Auth(UserRoles.PROVIDER, UserRoles.ADMIN)
  @Mutation('updateSpace')
  async updateSpace(
    @Args('payload') payload: UpdateSpacePayload,
    @Args('where') where: UpdateSpaceFilter,
    @AuthUser() user: IAuthUser,
  ): Promise<UpdateSpaceResp> {
    const options = {
      user_id: user.user_id,
      roles: user.roles,
      isAdmin: user.hasRole(UserRoles.ADMIN),
      isHost: user.hasRole(UserRoles.PROVIDER),
    };
    // validate payload
    await this.spaceService.validateUpdateSpacePayload(payload);
    // check if space exists
    const space = await this.spaceEntity.findByPk(where?.id?._eq);

    if (!space) {
      throw NotFoundError('Space not found!');
    }

    if (
      options.isHost &&
      !options.isAdmin &&
      space.user_id !== options.user_id
    ) {
      throw ForbiddenError("Space doesn't belongs to you");
    }

    if (
      space.status === SpaceStatus.ACTIVE &&
      ((payload?.height && payload?.height !== space.height) ||
        (payload?.width && payload?.width !== space.width))
    ) {
      throw ForbiddenError(
        'Host cannot change dimensions when status is active',
      );
    }

    return this.spaceService.update(where.id._eq, payload, options);
  }

  @Auth(UserRoles.PROVIDER, UserRoles.ADMIN)
  @Mutation('deleteSpace')
  async deleteSpace(
    @Args('where') where: DeleteSpaceFilter,
    @AuthUser() user: IAuthUser,
  ): Promise<DeleteSpaceResp> {
    const options = {
      user_id: user.user_id,
      roles: user.roles,
      isAdmin: user.hasRole(UserRoles.ADMIN),
      isHost: user.hasRole(UserRoles.PROVIDER),
    };

    return this.spaceService.delete(where?.id?._eq, options);
  }

  @AuthOptional()
  @Query('space')
  async space(
    @Args('where') where: UpdateSpaceFilter,
    @AuthUser() user: IAuthUser,
  ): Promise<Space> {
    const role = user.currentRequestRole;

    // if role is provided, must be PROVIDER or ADMIN
    if (
      (role && role !== UserRoles.PROVIDER && role !== UserRoles.ADMIN) ||
      (role && !user?.hasRole(role))
    ) {
      throw ForbiddenError('UnAuthorized');
    }

    if (role === UserRoles.PROVIDER) {
      return this.spaceService.getById(where?.id?._eq, user.user_id);
    }

    // otherwise admin(from admin panel) and customers(from client) can get all
    return this.spaceService.getById(where?.id?._eq);
  }

  @AuthOptional()
  @Query('spaces')
  async spaces(
    @Args('where') where: SpacesFilter,
    @Args('pagination') pagination: Pagination,
    @Args('sort_by') sortBy: SpacesSort,
    @Context() ctxt: any,
    @AuthUser() user: IAuthUser,
  ): Promise<SpacesResp> {
    const role = user.currentRequestRole;
    ctxt.moveInDate = where?.move_in_date?._eq;
    ctxt.where = where;
    // if role is provided, must be PROVIDER or ADMIN
    if (
      (role && role !== UserRoles.PROVIDER && role !== UserRoles.ADMIN) ||
      (role && !user?.hasRole(role))
    ) {
      throw ForbiddenError('UnAuthorized');
    }

    // if role is Provider, then provider can only get their spaces
    let options;
    if (role && role === UserRoles.PROVIDER) {
      options = { user_id: user.user_id };
    }

    return this.spaceService.findAll(pagination, where, options, sortBy);
  }

  @ResolveField('quotation')
  async getQuotationDetails(@Context() ctxt: any): Promise<Quotation> {
    return this.quotationService.getQuotation({
      uuid: ctxt?.where?.quotation_uuid,
      spaceId: ctxt?.where?.id?._eq,
      siteId: ctxt?.where?.site,
    });
  }

  @ResolveField('stock_available_until')
  async getLastStockAvailableDate(
    @Context() ctxt: any,
    @Parent() space: Space,
  ): Promise<Date> {
    if ((space as any).stock_management_type !== StockManagementType.SND) {
      return null;
    }

    return this.spaceService.getLastStockAvailableDate(
      space.id,
      space.available_units,
      space.total_units,
      ctxt.moveInDate,
    );
  }

  @ResolveField('prices')
  async prices(@Parent() space: Space): Promise<SpacePrice[]> {
    if (space?.prices) {
      return space.prices;
    }

    return this.priceService.getBySpaceId(space?.id);
  }

  @ResolveField('features')
  async features(@Parent() space: Space): Promise<PlatformFeature[]> {
    if (space.features) {
      return space.features;
    }

    return this.spaceFeatureService.getBySpaceId(space?.id);
  }
  @ResolveField('site')
  async site(@Parent() space: ISpaceEntity & { site: Site }): Promise<Site> {
    if (space?.site) {
      return space.site;
    }
    return this.siteService.getById(space?.site_id);
  }

  @ResolveField('images')
  async images(@Parent() space: Space): Promise<string[]> {
    if (!space.images) {
      return [];
    }

    return space.images;
  }

  @ResolveField('space_type')
  async space_type(@Parent() space: SpaceModel): Promise<PlatformSpaceType> {
    if (!space?.platform_space_type_id) {
      return null;
    }

    if (space.platform_space_type) {
      return (space.platform_space_type as unknown) as PlatformSpaceType;
    }

    return this.platformSpaceTypeService.getById(space?.platform_space_type_id);
  }
}
