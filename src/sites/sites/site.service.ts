import { Inject, Injectable, Logger } from '@nestjs/common';
import { isEmpty } from 'lodash';
import { IncludeOptions, Op, Transaction, WhereOptions } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

import { UserModel } from '../../auth/users/user.model';
import { UserService } from '../../auth/users/user.service';
import { BookingModel } from '../../bookings/booking.model';
import { CountryModel } from '../../countries/country.model';
import { EntityTaxModel } from '../../entity-taxes/entity-tax.model';
import {
  EntityIdFilter,
  Pagination,
  PlatformFeature,
  PlatformPolicy,
  PlatformPropertyType,
  PlatformRule,
  Site,
  SiteLocationFilter,
  SitePayload,
  SitesFilter,
  SitesResp,
  SitesSort,
  SiteStatus,
  SpaceStatus,
  TaxEntityType,
  UpdateSitePayload,
  UpdateSiteResp,
} from '../../graphql.schema';
import { PlatformAgreementModel } from '../../platform/agreements/agreement.model';
import { CommissionService } from '../../platform/commissions/commission.service';
import { PlatformFeatureModel } from '../../platform/features/feature.model';
import { PlatformPolicyModel } from '../../platform/policies/policy.model';
import { PlatformPropertyTypeModel } from '../../platform/property-types/property-type.model';
import { PlatformRuleModel } from '../../platform/rules/rule.model';
import { PlatformTaxModel } from '../../platform/taxes/tax.model';
import {
  COUNTRY_REPOSITORY,
  ENTITY_TAX_REPOSITORY,
  PLATFORM_AGREEMENT_REPOSITORY,
  PLATFORM_TAX_REPOSITORY,
  SEQUELIZE_PROVIDER,
  SITE_REPOSITORY,
} from '../../shared/constant/app.constant';
import {
  ForbiddenError,
  NotFoundError,
  PayloadError,
} from '../../shared/errors.messages';
import {
  getEmailTemplateT,
  TemplateNames,
} from '../../shared/mailer/email-templates';
import { NotificationService } from '../../shared/notifications/notification.service';
import { hasMoreRec, initPagination } from '../../shared/utils';
import { getCountryBaseCSEmail } from '../../shared/utils/country-config';
import {
  toSequelizeComparator,
  toSequelizeSort,
} from '../../shared/utils/graphql-to-sequelize-comparator';
import { PriceModel } from '../../spaces/prices/price.model';
import { SpaceFeatureModel } from '../../spaces/space-features/space-feature.model';
import { SpaceModel } from '../../spaces/spaces/space.model';
import { SpaceService } from '../../spaces/spaces/space.service';
import { SiteAddressModel } from '../site-addresses/site-address.model';
import { SiteAddressService } from '../site-addresses/site-address.service';
import { SiteFeatureModel } from '../site-features/site-feature.model';
import { SiteFeatureService } from '../site-features/site-feature.service';
import { SitePolicyModel } from '../site-policies/site-policy.model';
import { SitePolicyService } from '../site-policies/site-policy.service';
import { SiteRuleModel } from '../site-rules/site-rule.model';
import { SiteRuleService } from '../site-rules/site-rule.service';
import {
  ICreateSiteArgs,
  ICreateSitePayload,
  ISitesArgs,
} from './interfaces/site.interface';
import { SiteModel } from './site.model';
import createSiteValidator from './validation/create-site.validate';

@Injectable()
export class SiteService {
  private notificationService: NotificationService;

  private getSiteLocalizedPayload(type: 'name' | 'description', value: string) {
    if (value) {
      return {
        [type]: value,
        [`${type}_en`]: value,
        [`${type}_jp`]: value,
        [`${type}_kr`]: value,
        [`${type}_th`]: value,
      };
    }
  }

  constructor(
    @Inject(SEQUELIZE_PROVIDER)
    private readonly sequelize: Sequelize,
    @Inject(SITE_REPOSITORY)
    private readonly siteEntity: typeof SiteModel,
    @Inject(PLATFORM_AGREEMENT_REPOSITORY)
    private readonly agreementEntity: typeof PlatformAgreementModel,
    @Inject(PLATFORM_TAX_REPOSITORY)
    private readonly platformTaxEntity: typeof PlatformTaxModel,
    @Inject(ENTITY_TAX_REPOSITORY)
    private readonly entityTax: typeof EntityTaxModel,
    @Inject(COUNTRY_REPOSITORY)
    private readonly countryEntity: typeof CountryModel,
    private readonly addressService: SiteAddressService,
    private readonly siteRuleService: SiteRuleService,
    private readonly sitePolicyService: SitePolicyService,
    private readonly siteFeatureService: SiteFeatureService,
    private readonly commissionService: CommissionService,
    private readonly spaceService: SpaceService,
    private readonly userService: UserService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(SiteService.name);
    this.notificationService = new NotificationService();
  }

  public async validatePayload(
    payload: SitePayload | UpdateSitePayload,
  ): Promise<void> {
    try {
      await createSiteValidator.validate(payload);
    } catch (e) {
      throw PayloadError(e.message);
    }
  }

  async getById(id: number): Promise<Site> {
    const siteData = await this.siteEntity.findByPk(id);

    if (!siteData) {
      return null;
    }

    return (siteData as undefined) as Site;
  }

  async getFeatures(siteId: number): Promise<PlatformFeature[]> {
    const site = await this.siteEntity.findByPk(siteId, {
      include: [
        { model: SiteFeatureModel, include: [{ model: PlatformFeatureModel }] },
      ],
    });

    return site.features.map(
      (siteFeat) => (siteFeat.feature as undefined) as PlatformFeature,
    );
  }

  async getPolicies(siteId: number): Promise<PlatformPolicy[]> {
    const site = await this.siteEntity.findByPk(siteId, {
      include: [
        { model: SitePolicyModel, include: [{ model: PlatformPolicyModel }] },
      ],
    });

    return site.policies.map((sitePolicy) => sitePolicy.policy);
  }

  async getRules(siteId: number): Promise<PlatformRule[]> {
    const site = await this.siteEntity.findByPk(siteId, {
      include: [
        { model: SiteRuleModel, include: [{ model: PlatformRuleModel }] },
      ],
    });

    return site.rules.map((siteRule) => siteRule.rule);
  }

  async getPropertyType(siteId: number): Promise<PlatformPropertyType> {
    const site = await this.siteEntity.findByPk(siteId, {
      include: [{ model: PlatformPropertyTypeModel }],
    });

    return site.property_type;
  }

  private toArray<T>(obj: T, arr: T[]): T[] {
    return obj ? [obj] : arr || [];
  }

  private isLocationFilterValid(location: SiteLocationFilter) {
    const longitude = location?.longitude?._eq;
    const latitude = location?.latitude?._eq;
    const maxDistance = location?.distance?._eq;

    return longitude && latitude && maxDistance;
  }

  /**
   * Find/Search for Sites and Spaces with filters on:
   * Site:
   *  - id, name and status
   *  - Site.Feature and Site.Address
   * Spaces:
   *  - platform_space_type_id
   *  - Space.Feature
   *  - Space.Price (monthly for now)
   *
   * And only include the models if some of the search params was provided,
   * like only include space price if price filter was provided
   */
  async findAll(
    pagination: Pagination,
    sort: SitesSort,
    where: SitesFilter = {},
    args?: ISitesArgs,
  ): Promise<SitesResp> {
    this.logger.setContext(SiteService.name);
    this.logger.log(`findAll with payload where: ${JSON.stringify(where)}`);

    pagination = initPagination(pagination);

    let include = [];
    let includeSpace = false;
    const longitude = where.location?.longitude?._eq;
    const latitude = where.location?.latitude?._eq;
    const maxDistance = where.location?.distance?._eq;
    const siteFeatureIds = this.toArray<EntityIdFilter['_eq']>(
      where?.site_platform_feature_id?._eq,
      where?.site_platform_feature_id?._in,
    );
    const spaceFeatureIds = this.toArray<EntityIdFilter['_eq']>(
      where?.space_platform_feature_id?._eq,
      where?.space_platform_feature_id?._in,
    );

    // Site Features filter
    if (siteFeatureIds.length > 0) {
      include.push(
        this.getModel(
          SiteFeatureModel,
          {
            feature_id: { _in: siteFeatureIds },
          },
          true,
          [PlatformFeatureModel],
        ),
      );
    }

    // country filter
    let countryFilter = where.country_id;
    if (where?.country) {
      const country = await this.countryEntity.findOne({
        where: {
          name_en: where?.country?._eq,
        },
      });

      countryFilter = { _eq: country?.id ?? 0 };
    }

    // Site Address Filter
    const addressFilter = {
      country_id: countryFilter,
      city_id: where.city_id,
      district_id: where.district_id,
    };

    include.push(this.getModel(SiteAddressModel, addressFilter));

    const spaceFilter = {
      platform_space_type_id: where.platform_space_type_id,
      status:
        where?.status?._eq === SiteStatus.ACTIVE
          ? { _eq: SpaceStatus.ACTIVE }
          : undefined,
    };
    const spaceModel = this.getModel(SpaceModel, spaceFilter, true);

    if (!isEmpty(where.platform_space_type_id)) {
      includeSpace = true;
    }

    // Space Features filter
    if (spaceFeatureIds.length) {
      spaceModel.include.push(
        this.getModel(SpaceFeatureModel, {
          feature_id: { _in: spaceFeatureIds },
        }),
      );
      includeSpace = true;
    }

    const priceModel = this.getModel(PriceModel, {
      price_per_month: where.price,
    });

    if (priceModel) {
      spaceModel.include.push(priceModel);
      includeSpace = true;
    }

    include = include.concat(includeSpace ? [spaceModel] : []);

    const siteFilter = {
      id: where.id,
      name: where.name,
      status: where.status,
      is_featured: where.is_featured ? { _eq: where.is_featured } : undefined,
      created_by: args?.user_id ? { _eq: args.user_id } : undefined,
      stock_management_type: where.stock_management_type,
    };

    let whereSite: WhereOptions = toSequelizeComparator(siteFilter);
    let attributes = {};

    if (this.isLocationFilterValid(where.location)) {
      /**
       * Looks like this:
       * ST_Distance('POINT(100.607367 13.6853423)'::geography, "point")
       */
      whereSite = Sequelize.and(
        { ...whereSite },
        Sequelize.where(
          Sequelize.fn(
            'ST_Distance',
            Sequelize.literal(`'POINT(${longitude} ${latitude})'::geography`),
            Sequelize.col('point'),
          ),
          { [Op.lt]: maxDistance } as any,
        ),
      );
      /**
       * Looks like this:
       * ROUND(CAST(ST_Distance(CAST(POINT('100.607367 13.6853423') AS GEOGRAPHY), "point") AS DECIMAL), 2)
       */
      attributes = {
        include: [
          [
            Sequelize.fn(
              'ROUND',
              Sequelize.cast(
                Sequelize.fn(
                  'ST_Distance',
                  Sequelize.literal(
                    `'POINT(${longitude} ${latitude})'::geography`,
                  ),
                  Sequelize.col('point'),
                ),
                'decimal',
              ),
              2,
            ),
            'distance',
          ],
        ],
      };
      include = include.concat(SiteAddressModel);
    }

    const options = {
      include,
      limit: pagination.limit,
      where: whereSite,
      attributes,
      offset: pagination.skip,
      order: toSequelizeSort(sort),
      distinct: true,
    };
    const { count, rows } = await this.siteEntity.findAndCountAll(
      options as any,
    );

    const result = new SitesResp();
    const sites = (rows as undefined) as Site[];

    result.edges = sites;
    result.page_info = {
      ...pagination,
      total: count,
      has_more: hasMoreRec(count, pagination),
    };

    return result;
  }

  async findAllThirdParty(siteIds: string[]): Promise<SiteModel[]> {
    return this.siteEntity.findAll({
      where: {
        third_party_site_id: {
          [Op.in]: siteIds,
        },
      },
    });
  }

  async findAllActiveSites(): Promise<SiteModel[]> {
    return this.siteEntity.findAll({
      where: {
        status: {
          [Op.eq]: SiteStatus.ACTIVE,
        },
      },
      attributes: ['id'],
    });
  }

  async getAllSimilarSites(id: number, districtId: number): Promise<Site[]> {
    const rows = await this.siteEntity.findAll({
      where: {
        id: { [Op.ne]: id },
      },
      include: [
        {
          model: SiteAddressModel,
          where: {
            district_id: { [Op.eq]: districtId },
          },
        },
      ],
      order: [Sequelize.fn('RANDOM')],
    });

    return (rows as undefined) as Site[];
  }

  async create(
    payload: ICreateSitePayload,
    args: ICreateSiteArgs,
  ): Promise<Site> {
    const t = await this.sequelize.transaction();
    try {
      await this.validatePayload(payload);

      // for now we're adding default commission of 15 percent on every site
      const commission = await this.commissionService.getDefaultCommission();

      let addressId;
      if (payload.address) {
        const address = await this.addressService.upsert(
          null,
          payload.address,
          { t },
        );
        addressId = address.id;
      }
      const site = await this.siteEntity.create(
        {
          ...payload,
          ...this.getSiteLocalizedPayload('name', payload.name),
          ...this.getSiteLocalizedPayload('description', payload.description),
          user_id: args.user_id,
          commission_id: commission?.id,
          source_site_name: args?.source_site_name,
          address_id: addressId,
          created_by: args.user_id,
          updated_by: args.user_id,
        },
        { transaction: t },
      );

      await Promise.all([
        this.siteRuleService.upsert(site.id, payload.rules_id, t),
        this.sitePolicyService.upsert(site.id, payload.policies_id, t),
        this.siteFeatureService.upsert(site.id, payload.features_id, t),
      ]);
      await t.commit();

      // send email to host
      const user = await this.userService.findOne(args.user_id);
      let basedCountry: string;
      if (args.country) {
        basedCountry = args.country;
      } else {
        basedCountry = (
          await this.addressService.getById(payload.address?.country_id)
        )?.country?.name_en;
      }

      await this.notificationService.sendEmail(user.email, {
        data: {
          site_id: site.id,
          first_name: user.first_name || '',
          cs_email: getCountryBaseCSEmail(basedCountry),
        },
        template_id: getEmailTemplateT(
          TemplateNames.HOST_NEW_SITE_SUBMITTED,
          user?.preferred_language,
        ),
      });

      return this.getById(site.id);
    } catch (error) {
      this.logger.error('Create Site Error: ', error?.stack);

      // rollback the transaction.
      await t.rollback();

      throw error;
    }
  }

  // eslint-disable-next-line complexity
  async update(
    id: number,
    payload: UpdateSitePayload,
    args: ICreateSiteArgs,
  ): Promise<UpdateSiteResp> {
    const t = await this.sequelize.transaction();
    try {
      await this.validatePayload(payload);

      const site = await this.siteEntity.findByPk(id, {
        include: [
          { model: UserModel },
          { model: SiteAddressModel, include: [{ model: CountryModel }] },
        ],
      });

      if (!site) {
        throw NotFoundError('Site not found');
      }

      //
      if (
        !args.isAdmin &&
        payload.status &&
        payload.status !== SiteStatus.ACTIVE &&
        payload.status !== SiteStatus.INACTIVE &&
        payload.status !== SiteStatus.READY_TO_REVIEW
      ) {
        throw ForbiddenError(
          `Host cannot changed a site to "${payload.status}" status`,
        );
      }

      //
      if (
        !args.isAdmin &&
        payload.status &&
        payload.status === SiteStatus.ACTIVE &&
        site.status !== SiteStatus.INACTIVE
      ) {
        throw ForbiddenError(
          `Host cannot changed a site to "${payload.status}" from ${site.status}`,
        );
      }

      // host can only update their sites
      if (args.isHost && !args.isAdmin && site.user_id !== args.user_id) {
        throw ForbiddenError("Site doesn't belongs to you");
      }

      const siteExistingStatus = site.status;
      let moveToReadyToReview = false;
      if (payload.address) {
        const address = await this.addressService.upsert(
          site.address_id,
          payload.address,
          {
            t,
          },
        );
        if (!site.address_id) {
          site.address_id = address.id;
        }
        moveToReadyToReview = true;
      }

      if (payload.name) {
        site.name = payload.name;
        site.name_en = payload.name;
        site.name_jp = payload.name;
        site.name_kr = payload.name;
        site.name_th = payload.name;
        moveToReadyToReview = true;
      }

      if (payload.property_type_id) {
        site.property_type_id = payload.property_type_id;
      }

      if (payload.provider_type) {
        site.provider_type = payload.provider_type;
      }

      if (payload.status) {
        site.status = payload.status;
      }

      if (payload.description) {
        site.description = payload.description;
        site.description_en = payload.description;
        site.description_jp = payload.description;
        site.description_kr = payload.description;
        site.description_th = payload.description;
      }

      if (payload.floor) {
        site.floor = payload.floor;
      }

      if (payload.images) {
        site.images = payload.images;
        moveToReadyToReview = true;
      }

      site.updated_by = args.user_id;

      if (moveToReadyToReview) {
        site.status = SiteStatus.READY_TO_REVIEW;
      }

      const promises = [];

      if (payload.address) {
        // set default agreement of selected country
        if (!site.agreement_id) {
          const agreement = await this.getDefaultAgreement(
            payload.address?.country_id,
          );
          if (agreement) {
            site.agreement_id = agreement.id;
          }
        }

        // set default tax of selected country
        promises.concat(
          await this.assignDefaultTax(
            payload.address?.country_id,
            site.id,
            args?.user_id,
            t,
          ),
        );
      }

      promises.push(site.save({ transaction: t }));

      if (payload.rules_id) {
        promises.push(
          this.siteRuleService.upsert(site.id, payload.rules_id, t),
        );
      }

      if (payload.policies_id) {
        promises.push(
          this.sitePolicyService.upsert(site.id, payload.policies_id, t),
        );
      }

      if (payload.features_id) {
        promises.push(
          this.siteFeatureService.upsert(site.id, payload.features_id, t),
        );
      }

      await Promise.all(promises);
      await t.commit();

      // send email to host if admin approved the site status
      if (
        args.isAdmin &&
        payload.status === SiteStatus.ACTIVE &&
        siteExistingStatus !== SiteStatus.ACTIVE
      ) {
        await this.notificationService.sendEmail(site.user?.email, {
          data: {
            site_id: site.id,
            first_name: site.user?.first_name || '',
            cs_email: getCountryBaseCSEmail(site.address?.country?.name_en),
          },
          template_id: getEmailTemplateT(
            TemplateNames.HOST_NEW_SITE_LISTED,
            site.user?.preferred_language,
          ),
        });
      }

      return {
        modified: 1,
        edges: [await this.getById(site.id)],
      };
    } catch (error) {
      this.logger.error('Update Site Error: ', error?.stack);

      // rollback the transaction.
      await t.rollback();

      throw error;
    }
  }

  private getModel(model, filter, force?: boolean, include = []) {
    const where: WhereOptions = toSequelizeComparator(filter);

    if (Object.keys(where).length) {
      return { model, where, include };
    }

    if (force) {
      return { model, include };
    }

    return { model, include };
  }

  private async getDefaultAgreement(
    countryId: number,
  ): Promise<PlatformAgreementModel> {
    return this.agreementEntity.findOne({
      where: {
        country_id: countryId,
        is_default: true,
      },
    });
  }

  /**
   * Ass default taxes to site if there isn't any assigned before.
   */
  private async assignDefaultTax(
    countryId: number,
    siteId: number,
    userId: number,
    t: Transaction,
  ): Promise<any[]> {
    const siteTaxes = await this.entityTax.findOne({
      where: {
        site_id: siteId,
      },
    });

    // if there are already taxes assigned to site, don't assign again.
    if (siteTaxes) {
      return [];
    }

    const taxes = await this.platformTaxEntity.findAll({
      where: {
        country_id: countryId,
        is_default: true,
        entity_type: TaxEntityType.SITE,
      },
    });

    return taxes.map((tax) =>
      this.entityTax.create(
        {
          site_id: siteId,
          tax_id: tax.id,
          created_by: userId,
          updated_by: userId,
        },
        { transaction: t },
      ),
    );
  }

  private includeBookingsInSpace(
    moveInDate: Date,
    moveOutDate: Date,
    spaceModel: any,
    includeSpace: boolean,
  ): boolean {
    if (moveInDate) {
      includeSpace = true;
      const whereBooking = this.spaceService.getActiveBookingsWhere(
        moveInDate,
        moveOutDate,
      );

      const bookingInclude: IncludeOptions = {
        model: BookingModel,
        where: whereBooking,
        required: false,
        attributes: ['id'],
      };
      spaceModel.include.push(bookingInclude);
    }

    return includeSpace;
  }
}
