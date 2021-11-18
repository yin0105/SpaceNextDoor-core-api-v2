import { Inject, Injectable, Logger } from '@nestjs/common';
import dayjs from 'dayjs';
import { Op, Sequelize, Transaction, WhereOptions } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import { UserModel } from '../auth/users/user.model';
import { UserService } from '../auth/users/user.service';
import { CountryModel } from '../countries/country.model';
import { DistrictModel } from '../countries/districts/district.model';
import {
  FixedCountry,
  Promotion,
  Quotation,
  QuotationPayload,
  QuotationResp,
  QuotationStatus,
  SiteStatus,
  SpaceStatus,
} from '../graphql.schema';
import { PlatformFeatureModel } from '../platform/features/feature.model';
import { PlatformSpaceTypeModel } from '../platform/space-types/space-type.model';
import { PromotionModel } from '../promotions/promotion/promotion.model';
import { PromotionService } from '../promotions/promotion/promotion.service';
import getQuotationClevertapData from '../shared/clevertap/clevertap-data.utils';
import { ClevertapService } from '../shared/clevertap/clevertap.service';
import {
  QUOTATION_ITEM_REPOSITORY,
  QUOTATION_REPOSITORY,
  SEQUELIZE_PROVIDER,
  SPACE_REPOSITORY,
} from '../shared/constant/app.constant';
import { BadRequestError } from '../shared/errors.messages';
import { ErrorNames, getMessageT } from '../shared/lang.messages';
import {
  getEmailTemplateT,
  TemplateNames,
} from '../shared/mailer/email-templates';
import { NotificationService } from '../shared/notifications/notification.service';
import { toSequelizeComparator } from '../shared/utils/graphql-to-sequelize-comparator';
import getQuotationTemplateData, {
  IQType,
} from '../shared/utils/quotation-template-data';
import { getAvailableStocks } from '../shared/utils/stock-services';
import { SiteAddressModel } from '../sites/site-addresses/site-address.model';
import { SiteAddressService } from '../sites/site-addresses/site-address.service';
import { SiteFeatureModel } from '../sites/site-features/site-feature.model';
import { SiteModel } from '../sites/sites/site.model';
import { SiteService } from '../sites/sites/site.service';
import { PriceModel } from '../spaces/prices/price.model';
import { SpaceFeatureModel } from '../spaces/space-features/space-feature.model';
import { SpaceModel } from '../spaces/spaces/space.model';
import { SpaceService } from '../spaces/spaces/space.service';
import { getPlainObject } from '../utils';
import {
  IQuotationArgs,
  IQuotationEmailArgs,
  IQuotationEntity,
  IQuotationItemEntity,
  IQuotationUpdate,
} from './interfaces/quotation.interface';
import { QuotationItemModel } from './models/quotation-item.model';
import { QuotationModel } from './models/quotation.model';

@Injectable()
export class QuotationService {
  private notificationService: NotificationService;
  constructor(
    @Inject(SEQUELIZE_PROVIDER)
    private readonly sequelize: Sequelize,
    @Inject(QUOTATION_REPOSITORY)
    private readonly quotationEntity: typeof QuotationModel,
    @Inject(QUOTATION_ITEM_REPOSITORY)
    private readonly quotationItemEntity: typeof QuotationItemModel,
    @Inject(SPACE_REPOSITORY)
    private readonly spaceEntity: typeof SpaceModel,
    private readonly userService: UserService,
    private readonly promotionService: PromotionService,
    private readonly spaceService: SpaceService,
    private readonly siteService: SiteService,
    private readonly addressService: SiteAddressService,
    private readonly clevertapService: ClevertapService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(QuotationService.name);
    this.notificationService = new NotificationService();
  }

  // eslint-disable-next-line complexity
  private async validateCreateQuotationPayload(
    payload: QuotationPayload,
  ): Promise<{ space?: SpaceModel; promo?: Promotion }> {
    if (payload.move_in_date < new Date()) {
      throw BadRequestError('Please provide correct move in date');
    }

    if (dayjs(payload.move_in_date).isAfter(dayjs().add(1, 'month'))) {
      throw BadRequestError('Move in date cannot be greater than 1 month!');
    }

    if (
      (payload?.district_ids?.length && !payload?.space_type_id) ||
      (payload?.space_type_id && !payload?.district_ids?.length)
    ) {
      throw BadRequestError('District ids and space type is required!');
    }

    let voucherPromotion: Promotion;
    if (payload?.promo_code) {
      voucherPromotion = await this.promotionService.getByCode(
        payload?.promo_code,
      );

      if (!voucherPromotion) {
        throw BadRequestError(`Promo code not found ${payload?.promo_code}`);
      }
    }

    let promotion: Promotion;
    if (payload?.promo_code) {
      promotion = await this.promotionService.getById(
        payload?.promotion_id,
        true,
      );

      if (!promotion) {
        throw BadRequestError(`Promotion not found ${payload?.promotion_id}`);
      }
    }

    let space: SpaceModel;
    // let site: SiteModel;
    if (payload?.space_id) {
      const spaceInfo = await this.spaceService.getById(
        payload?.space_id,
        null,
        true,
      );

      if (!spaceInfo || spaceInfo?.status !== SpaceStatus.ACTIVE) {
        throw BadRequestError('Space not found');
      }

      space = (spaceInfo as undefined) as SpaceModel;
    } else if (payload?.site_id) {
      const siteInfo = await this.siteService.getById(payload?.site_id);

      if (!siteInfo || siteInfo?.status !== SiteStatus.ACTIVE) {
        throw BadRequestError('Site not found');
      }
    }

    return {
      space,
      promo: promotion,
    };
  }

  private async getSiteWithSpaces(
    spaceIds: number[],
    typeId?: number,
  ): Promise<SiteModel> {
    const spaceFilter = {
      platform_space_type_id: typeId ? { _eq: typeId } : undefined,
      id: { _in: spaceIds },
    };

    const whereSpaces: WhereOptions = toSequelizeComparator(spaceFilter);

    const spaces = await this.spaceEntity.findAll({
      where: whereSpaces,
      limit: 3,
      offset: 0,
      include: [
        {
          model: PriceModel,
          required: true,
        },
      ],
      subQuery: false,
      order: [[{ model: PriceModel, as: 'prices' }, 'price_per_month', 'asc']],
    });

    if (spaces?.length) {
      let site = ((await this.siteService.getById(
        spaces[0].site_id,
      )) as undefined) as SiteModel;
      const address = await this.addressService.getById(site.address_id);
      site = getPlainObject(site);
      site.address = (address as undefined) as SiteAddressModel;

      return ({
        ...site,
        spaces: getPlainObject(spaces),
      } as undefined) as SiteModel;
    }
  }

  /**
   * TODO: Write some logic docs
   */
  public async createQuotation(
    payload: QuotationPayload,
  ): Promise<QuotationResp> {
    let t: Transaction;
    try {
      const validData = await this.validateCreateQuotationPayload(payload);

      let spaceTypeId = payload?.space_type_id;
      const siteIds = [];

      if (payload?.space_id) {
        spaceTypeId = validData?.space?.platform_space_type_id;
        siteIds.push(validData?.space?.site_id);
      } else if (payload?.site_id) {
        siteIds.push(payload?.site_id);
      } else if (payload?.district_ids) {
        const sites = await this.spaceService.findSitesByDistricts(
          payload?.district_ids,
        );
        sites.forEach(({ id }) => siteIds.push(id));
      }

      const availableStocks = await getAvailableStocks({
        site_ids: siteIds,
        move_in_date: dayjs().add(1, 'day').toDate(),
      });

      const promises = [];
      availableStocks.forEach((site) => {
        const spaceIds = site.spaces
          .map((s) => s.id)
          .filter((id) => {
            if (payload?.space_id) {
              return id === payload?.space_id;
            }
            return true;
          });
        promises.push(this.getSiteWithSpaces(spaceIds, spaceTypeId));
      });
      let sitesWithSpaces: SiteModel[] = (await Promise.all(promises)).filter(
        Boolean,
      );

      sitesWithSpaces = sitesWithSpaces.slice(0, 3); // max 3 sites in quotation

      if (!sitesWithSpaces.length) {
        //
        throw BadRequestError(
          getMessageT(
            ErrorNames.GET_QUOTATION_NO_SPACE,
            payload?.preferred_language,
          ),
        );
      }

      //
      t = await this.sequelize.transaction();
      const user = await this.userService.findOrCreateByEmailPhone(
        payload?.email,
        payload?.phone_number,
        {
          t,
          name: payload.first_name,
          last_name: payload.last_name,
          preferred_language: payload.preferred_language,
        },
      );

      // by default assign 10% discount promotion to quotation
      let promo = validData.promo;
      if (!validData?.promo) {
        let code;
        switch (sitesWithSpaces[0]?.address?.country?.name_en) {
          case FixedCountry.Singapore:
            code = 'SNDONLINE';
            break;
          case FixedCountry.Thailand:
            code = 'SNDONLINETH';
            break;
          case FixedCountry.Japan:
            code = 'SNDONLINEJP';
            break;
          case FixedCountry.Korea:
            code = 'SNDONLINEKR';
            break;
          default:
            code = 'SNDONLINE';
        }
        promo = await this.promotionService.getByCode(code);
      }

      //
      const quotationPayload: Partial<IQuotationEntity> = {
        uuid: uuidv4(),
        move_in_date: payload?.move_in_date,
        move_out_date: payload?.move_out_date ?? null,
        promotion_id: promo?.id,
        public_promotion_id: payload?.promotion_id,
        status: QuotationStatus.ACTIVE,
        user_id: user?.id,
        country_id: sitesWithSpaces[0]?.address?.country?.id,
      };

      const quotation = await this.quotationEntity.create(quotationPayload, {
        transaction: t,
      });

      const quotationItemsPayload: Partial<IQuotationItemEntity>[] = [];
      sitesWithSpaces.forEach((site) => {
        site?.spaces?.forEach((s) => {
          quotationItemsPayload.push({
            quotation_id: quotation?.id,
            site_id: s?.site_id,
            space_id: s?.id,
            price_per_month: s?.prices[0]?.price_per_month,
          });
        });
      });

      await this.quotationItemEntity.bulkCreate(quotationItemsPayload, {
        transaction: t,
      });

      await t.commit();

      //
      const quotationRes = await this.getQuotationById(quotation?.id);
      const result = (quotationRes.toJSON() as undefined) as QuotationModel;

      // push clever tap event
      try {
        const clevertapPayload = getQuotationClevertapData(
          result,
          IQType.QUOTATION,
          payload.email,
        );
        await this.clevertapService.pushEvents(clevertapPayload);
      } catch (error) {
        this.logger.error('Create quotation CleverTap Error:', error?.stack);
      }

      // send email
      await this.notificationService.sendEmail(user.email, {
        data: getQuotationTemplateData(
          result,
          IQType.QUOTATION,
          dayjs().add(7, 'days'),
        ),
        template_id: getEmailTemplateT(
          TemplateNames.GET_QUOTATION,
          payload?.preferred_language,
        ),
        country: sitesWithSpaces[0]?.address?.country?.name_en,
      });
      return { success: true };
    } catch (error) {
      this.logger.error('Create Quotation Error:', error?.stack);
      await t?.rollback();
      throw error;
    }
  }

  public validateGetQuotationArgs(args: IQuotationArgs): boolean {
    if (args.uuid && (args.siteId || args.spaceId)) {
      return false;
    }
    return true;
  }

  public async getQuotation(args: IQuotationArgs): Promise<Quotation> {
    if (this.validateGetQuotationArgs(args)) {
      throw BadRequestError('uuid, space or site id required');
    }

    const whereQuotationsItem: {
      site_id?: number | undefined;
      space_id?: number | undefined;
      user_id?: number | undefined;
    } = {};

    const whereQuotations: {
      uuid?: string | undefined;
      status: string;
      user_id?: number | undefined;
    } = { status: QuotationStatus.ACTIVE };

    if (args.uuid) {
      whereQuotations.uuid = args.uuid;
    }

    if (args.siteId) {
      whereQuotationsItem.site_id = args.siteId;
    }

    if (args.spaceId) {
      whereQuotationsItem.space_id = args.spaceId;
    }

    try {
      const quotation = await this.quotationEntity.findOne({
        where: whereQuotations,
        include: [
          {
            model: QuotationItemModel,
            where: args.userId
              ? { site_id: { [Op.eq]: args.siteId } }
              : whereQuotationsItem,
          },
          {
            model: UserModel,
          },
          {
            model: PromotionModel,
            as: 'public_promotion',
          },
          {
            model: PromotionModel,
            as: 'promotion',
          },
        ],
      });
      if (quotation) {
        return getPlainObject(quotation);
      }
    } catch (error) {
      this.logger.error('get Quotation Error:', error?.stack);
      throw error;
    }
  }

  public async getQuotations(
    args: IQuotationEmailArgs,
  ): Promise<QuotationModel[]> {
    let condition: WhereOptions = {};
    if (args.rejectDays) {
      condition = {
        created_at: {
          [Op.lt]: dayjs().subtract(args.rejectDays, 'day').toDate(),
        },
      };
    }
    if (args.reminderDays) {
      const fromDate = dayjs()
        .subtract(args.reminderDays, 'day')
        .startOf('day')
        .toDate();
      const toDate = dayjs()
        .subtract(args.reminderDays, 'day')
        .endOf('day')
        .toDate();
      condition = {
        created_at: { [Op.lte]: toDate, [Op.gte]: fromDate },
      };
    }
    return this.quotationEntity.findAll({
      where: {
        status: QuotationStatus.ACTIVE,
        ...condition,
      },
      include: [
        {
          model: UserModel,
        },
        { model: CountryModel },
        {
          model: QuotationItemModel,
          include: [
            {
              model: SiteModel,
              include: [
                {
                  model: SiteAddressModel,
                  include: [{ model: CountryModel }, { model: DistrictModel }],
                },
                {
                  model: SiteFeatureModel,
                  include: [{ model: PlatformFeatureModel }],
                },
              ],
            },
            {
              model: SpaceModel,
              include: [
                { model: PriceModel },
                { model: PlatformSpaceTypeModel },
                {
                  model: SpaceFeatureModel,
                  include: [{ model: PlatformFeatureModel }],
                },
              ],
            },
          ],
        },
      ],
    });
  }

  public async updateQuotation(
    id: number,
    payload: IQuotationUpdate,
  ): Promise<QuotationResp> {
    try {
      if (!id) {
        throw BadRequestError('Sorry, quotationID does not exist');
      }

      await this.quotationEntity.update(payload, {
        where: { id: { [Op.eq]: id } },
      });
      return { success: true };
    } catch (error) {
      this.logger.error('Update Quotation Error:', error?.stack);
    }
  }

  async getQuotationById(id: number): Promise<QuotationModel> {
    return this.quotationEntity.findOne({
      where: { id },
      include: [
        {
          model: UserModel,
        },
        { model: CountryModel },
        {
          model: QuotationItemModel,
          include: [
            {
              model: SiteModel,
              include: [
                {
                  model: SiteAddressModel,
                  include: [{ model: CountryModel }, { model: DistrictModel }],
                },
                {
                  model: SiteFeatureModel,
                  include: [{ model: PlatformFeatureModel }],
                },
              ],
            },
            {
              model: SpaceModel,
              include: [
                { model: PriceModel },
                { model: PlatformSpaceTypeModel },
                {
                  model: SpaceFeatureModel,
                  include: [{ model: PlatformFeatureModel }],
                },
              ],
            },
          ],
        },
      ],
    });
  }
}
