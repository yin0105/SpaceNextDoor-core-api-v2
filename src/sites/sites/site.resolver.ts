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
  Pagination,
  PlatformAgreement,
  PlatformFeature,
  PlatformPolicy,
  PlatformPropertyType,
  PlatformRule,
  Quotation,
  Site,
  SiteAddress,
  SitePayload,
  SitesFilter,
  SitesResp,
  SitesSort,
  SitesSpacesFilter,
  SitesSpacesSort,
  SortBy,
  SpacesResp,
  UpdateSiteFilter,
  UpdateSiteResp,
} from '../../graphql.schema';
import { PlatformAgreementModel } from '../../platform/agreements/agreement.model';
import { QuotationService } from '../../quotations/quotation.service';
import { ReviewService } from '../../reviews/review.service';
import { PLATFORM_AGREEMENT_REPOSITORY } from '../../shared/constant/app.constant';
import { ForbiddenError } from '../../shared/errors.messages';
import { SpaceService } from '../../spaces/spaces/space.service';
import { SiteAddressService } from '../site-addresses/site-address.service';
import { ISiteEntity } from './interfaces/site.interface';
import { SiteService } from './site.service';

@Resolver('Site')
export class SiteResolver {
  constructor(
    private readonly siteService: SiteService,
    private readonly addressService: SiteAddressService,
    private readonly spaceService: SpaceService,
    private readonly reviewService: ReviewService,
    private readonly quotationService: QuotationService,
    @Inject(PLATFORM_AGREEMENT_REPOSITORY)
    private readonly agreementEntity: typeof PlatformAgreementModel,
    private readonly logger: Logger,
  ) {}

  @Auth(UserRoles.PROVIDER, UserRoles.ADMIN)
  @Mutation('createSite')
  async createSite(
    @AuthUser() user: IAuthUser,
    @Args('payload') payload: SitePayload,
    @Context() context,
  ): Promise<Site> {
    const country = context?.req?.headers?.country;
    const options = {
      user_id: user.user_id,
      roles: user.roles,
      isAdmin: user.hasRole(UserRoles.ADMIN),
      isHost: user.hasRole(UserRoles.PROVIDER),
      country,
    };
    return this.siteService.create(payload, options);
  }

  @Auth(UserRoles.PROVIDER, UserRoles.ADMIN)
  @Mutation('updateSite')
  async updateSite(
    @AuthUser() user: IAuthUser,
    @Args('payload') payload: SitePayload,
    @Args('where') where: UpdateSiteFilter,
  ): Promise<UpdateSiteResp> {
    const options = {
      user_id: user.user_id,
      roles: user.roles,
      isAdmin: user.hasRole(UserRoles.ADMIN),
      isHost: user.hasRole(UserRoles.PROVIDER),
    };
    return this.siteService.update(where.id._eq, payload, options);
  }

  @AuthOptional()
  @Query('sites')
  async getSites(
    @AuthUser() user: IAuthUser,
    @Context() context,
    @Args('pagination') pagination: Pagination,
    @Args('where') where?: SitesFilter,
    @Args('sort_by') sortBy: SitesSort = { created_at: SortBy.desc },
  ): Promise<SitesResp> {
    const role = user.currentRequestRole;
    context.__sites_where = where; // need this in property resolver

    // if role is provided, must be PROVIDER
    if (
      (role && role !== UserRoles.PROVIDER) ||
      (role && !user?.hasRole(role))
    ) {
      throw ForbiddenError('UnAuthorized');
    }

    let optionArgs;
    if (role && role === UserRoles.PROVIDER) {
      optionArgs = { user_id: user.user_id };
    }

    return this.siteService.findAll(pagination, sortBy, where, optionArgs);
  }

  @ResolveField('address')
  async address(
    @Parent() site: ISiteEntity & { address: SiteAddress },
  ): Promise<SiteAddress> {
    if (site.address) {
      return site.address;
    }

    return this.addressService.getById(site.address_id);
  }

  @ResolveField('spaces')
  async spaces(
    @Parent() site: Site,
    @AuthUser() user: IAuthUser,
    @Args('pagination') pagination: Pagination,
    @Args('where') where: SitesSpacesFilter,
    @Args('sort_by') sortBy: SitesSpacesSort,
  ): Promise<SpacesResp> {
    const role = user.currentRequestRole;

    let optionArgs;
    if (role && role === UserRoles.PROVIDER) {
      optionArgs = { user_id: user.user_id };
    }

    return this.spaceService.findAll(
      pagination,
      { ...where, site_id: { _eq: site.id } } as any,
      optionArgs,
      sortBy,
    );
  }

  @ResolveField('reviews')
  async reviews(@Parent() site: Site): Promise<any> {
    return this.reviewService.getAverage(site.id);
  }

  @ResolveField('images')
  async images(@Parent() site: Site): Promise<string[]> {
    if (!site.images) {
      return [];
    }

    return site.images;
  }

  @ResolveField('features')
  async features(@Parent() site: Site): Promise<PlatformFeature[]> {
    return this.siteService.getFeatures(site.id);
  }

  @ResolveField('policies')
  async policies(@Parent() site: Site): Promise<PlatformPolicy[]> {
    if (site.policies) {
      return site.policies;
    }

    return this.siteService.getPolicies(site.id);
  }

  @ResolveField('rules')
  async rules(@Parent() site: Site): Promise<PlatformRule[]> {
    if (site.rules) {
      return site.rules;
    }

    return this.siteService.getRules(site.id);
  }

  @ResolveField('property_type')
  async propertyType(@Parent() site: Site): Promise<PlatformPropertyType> {
    if (site.property_type) {
      return site.property_type;
    }

    return this.siteService.getPropertyType(site.id);
  }

  @ResolveField('agreement')
  async agreement(@Parent() site: ISiteEntity): Promise<PlatformAgreement> {
    if (site.agreement_id) {
      return this.agreementEntity.findByPk(site.agreement_id);
    }
  }

  @ResolveField('similar_sites')
  async similarSites(
    @Parent() site: Site,
    @Context() context,
  ): Promise<Site[]> {
    const where: SitesFilter = context?.__sites_where;
    if (site.similar_sites?.length) {
      return site.similar_sites;
    }

    if (where?.district_id?._eq) {
      return this.siteService.getAllSimilarSites(
        site.id,
        where?.district_id?._eq,
      );
    }

    return [];
  }

  @ResolveField('quotation')
  async quotation(
    @Parent() site: Site,
    @Context() context,
  ): Promise<Quotation> {
    const where: SitesFilter = context?.__sites_where;
    const condition = {
      uuid: where.quotation_id._eq,
      siteId: site.id,
    };
    return this.quotationService.getQuotation(condition);
  }
}
