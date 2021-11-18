import { Inject, Injectable, Logger } from '@nestjs/common';
import dayJS from 'dayjs';
import {
  FindAndCountOptions,
  IncludeOptions,
  Op,
  Order,
  WhereOptions,
} from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

import { BookingModel } from '../../bookings/booking.model';
import { BookingService } from '../../bookings/booking.service';
import { CountryModel } from '../../countries/country.model';
import {
  Booking,
  BookingStatus,
  DeleteSpaceResp,
  Pagination,
  PriceType,
  SiteStatus,
  Space,
  SpacePayload,
  SpacesByTypeFilter,
  SpacesResp,
  SpaceStatus,
  StockManagementType,
  UpdateSpacePayload,
  UpdateSpaceResp,
} from '../../graphql.schema';
import { PlatformFeatureModel } from '../../platform/features/feature.model';
import { PlatformSpaceTypeModel } from '../../platform/space-types/space-type.model';
import { PlatformSpaceTypeService } from '../../platform/space-types/space-type.service';
import {
  COUNTRY_REPOSITORY,
  SEQUELIZE_PROVIDER,
  SITE_REPOSITORY,
  SPACE_REPOSITORY,
} from '../../shared/constant/app.constant';
import {
  ForbiddenError,
  NotFoundError,
  PayloadError,
} from '../../shared/errors.messages';
import { hasMoreRec, initPagination } from '../../shared/utils';
import { toSequelizeComparator } from '../../shared/utils/graphql-to-sequelize-comparator';
import { getAvailableStocks } from '../../shared/utils/stock-services';
import { SiteAddressModel } from '../../sites/site-addresses/site-address.model';
import { SiteModel } from '../../sites/sites/site.model';
import { ISpacePriceEntity } from '../prices/interfaces/price.interface';
import { PriceModel } from '../prices/price.model';
import { PriceService } from '../prices/price.service';
import { SpaceFeatureModel } from '../space-features/space-feature.model';
import { SpaceFeatureService } from '../space-features/space-feature.service';
import {
  ICreateSpaceArgs,
  ICreateSpacePayload,
  IMergeBookingResponse,
  ISpaceFindAllSort,
  ISpaceFindAllWhere,
} from './interfaces/space.interface';
import { SpaceModel } from './space.model';
import createSpaceValidator from './validation/create.space.validation';
import updateSpaceValidator from './validation/update.space.validation';

@Injectable()
export class SpaceService {
  constructor(
    @Inject(SEQUELIZE_PROVIDER)
    private readonly sequelize: Sequelize,
    @Inject(SPACE_REPOSITORY)
    private readonly spaceEntity: typeof SpaceModel,
    @Inject(SITE_REPOSITORY)
    private readonly siteEntity: typeof SiteModel,
    private readonly priceService: PriceService,
    @Inject(COUNTRY_REPOSITORY)
    private readonly countryEntity: typeof CountryModel,
    private readonly bookingService: BookingService,
    private readonly spaceFeatureService: SpaceFeatureService,
    private readonly platformSpaceTypeService: PlatformSpaceTypeService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(SpaceService.name);
  }

  public async validateSpacePayload(payload: SpacePayload): Promise<void> {
    try {
      await createSpaceValidator.validate(payload);
    } catch (e) {
      throw PayloadError(e.message);
    }
  }

  public async validateUpdateSpacePayload(
    payload: UpdateSpacePayload,
  ): Promise<void> {
    try {
      await updateSpaceValidator.validate(payload);
    } catch (e) {
      throw PayloadError(e.message);
    }
  }

  public async getById(
    spaceId: number,
    userId?: number,
    getPrice = false,
  ): Promise<Space> {
    let spaceFilter = [];

    if (userId) {
      spaceFilter = [
        { id: { [Op.eq]: spaceId } },
        { user_id: { [Op.eq]: userId } },
      ];
    } else {
      spaceFilter = [{ id: { [Op.eq]: spaceId } }];
    }

    let include;
    if (getPrice) {
      include = [{ model: PriceModel, required: true }];
    }

    const spaceData = await this.spaceEntity.findOne({
      where: {
        [Op.and]: spaceFilter,
      },
      include,
    });

    if (!spaceData) {
      throw NotFoundError('Space not found!');
    }

    return (spaceData as undefined) as Space;
  }

  async getBySiteId(siteId: number): Promise<Space[]> {
    const spacesData = await this.spaceEntity.findAll({
      where: { site_id: { [Op.eq]: siteId } },
      order: [['size', 'ASC']],
    });
    return (spacesData as undefined) as Space[];
  }

  /**
   * Find/Search for Spaces with filters on:
   * Spaces:
   *  - ids
   */
  async findAll(
    pagination: Pagination,
    where?: ISpaceFindAllWhere,
    args?: ICreateSpaceArgs,
    sortBy?: ISpaceFindAllSort,
  ): Promise<SpacesResp> {
    this.logger.setContext(SpaceService.name);
    this.logger.log(`findAll with payload where: ${JSON.stringify(where)}`);

    pagination = initPagination(pagination);
    let priceFilter;
    let featureFilter;

    const spaceFilter = {
      id: where.id,
      platform_space_type_id: where.type_id,
      status: where.status,
      site_id: where.site_id,
      user_id: args?.user_id ? { _eq: args.user_id } : undefined,
    };

    const whereSpaces: WhereOptions = toSequelizeComparator(spaceFilter);

    const whereBooking = this.getActiveBookingsWhere(
      dayJS(where?.move_in_date?._eq).utc(true).add(1, 'day').toDate(),
      where?.move_out_date?._eq,
    );

    if (where.price) {
      priceFilter = toSequelizeComparator({
        price_per_month: where.price,
      });
    }

    if (where.feature_id) {
      featureFilter = toSequelizeComparator({
        feature_id: where.feature_id,
      });
    }

    const include: IncludeOptions[] = [
      {
        model: BookingModel,
        where: whereBooking,
        required: false,
        attributes: ['id', 'move_in_date'],
      },
      {
        model: PlatformSpaceTypeModel,
        required: false,
      },
      {
        model: PriceModel,
        where: priceFilter,
        required: false,
      },
      {
        model: SpaceFeatureModel,
        where: featureFilter,
        include: [PlatformFeatureModel],
        required: false,
      },
    ];

    if (!where?.site_id && where?.country) {
      const country = await this.countryEntity.findOne({
        where: {
          name_en: where.country._eq,
        },
      });

      include.push({
        model: SiteModel,
        where: {
          status: SiteStatus.ACTIVE,
        },
        include: [
          {
            model: SiteAddressModel,
            where: {
              country_id: country?.id ?? 0,
            },
          },
        ],
        required: true,
      });
    }

    const options: FindAndCountOptions = {
      where: whereSpaces,
      limit: pagination.limit,
      offset: pagination.skip,
    };

    if (where.available_units) {
      delete options.offset;
      delete options.limit;
    }

    const { count, rows } = await this.spaceEntity.findAndCountAll({
      ...options,
      include,
      distinct: true,
      subQuery: false,
      order: this.getSpacesSortOrder(sortBy),
    });

    const result = new SpacesResp();
    // Since space_features table is many to many and we need actual features in
    // response, map the space features and return actual feature objects in the array
    let edges = rows.map((sp) => {
      (sp.features as any) = sp.features.map((f) => f.feature);
      sp.available_units = this.getStock(sp);
      return sp;
    });

    if (where.available_units) {
      edges = edges.filter((space) =>
        this.checkStock(space, where.available_units),
      );
    }

    if (pagination && where.available_units) {
      result.page_info = {
        ...pagination,
        total: edges.length,
        has_more: hasMoreRec(edges.length, pagination),
      };
      edges = edges.slice(pagination.skip, pagination.skip + pagination.limit);
    } else {
      result.page_info = {
        ...pagination,
        total: count,
        has_more: hasMoreRec(count, pagination),
      };
    }

    result.edges = (edges as undefined) as Space[];

    return result;
  }

  async findSitesByDistricts(districtIds: number[]): Promise<SiteModel[]> {
    return this.siteEntity.findAll({
      where: {
        status: {
          [Op.eq]: SiteStatus.ACTIVE,
        },
        stock_management_type: {
          [Op.ne]: StockManagementType.AFFILIATE,
        },
      },
      include: [
        {
          model: SiteAddressModel,
          required: true,
          where: {
            district_id: { [Op.in]: districtIds },
          },
        },
      ],
      attributes: ['id'],
    });
  }

  async findAvailableSpaces(
    typeId: number,
    where: SpacesByTypeFilter,
    sortBy?: ISpaceFindAllSort,
  ): Promise<SpacesResp> {
    const result = new SpacesResp();
    result.edges = [];
    result.page_info = {
      limit: 1,
      skip: 0,
      total: 1,
      has_more: false,
    };

    // return empty if there is no site or districts
    if (!where?.site_id && !where?.district_ids?._in.length) {
      return result;
    }

    const spaceIds: number[] = [];
    let siteIds: number[] = [];

    // filter by site only or by district ids
    if (where?.site_id) {
      siteIds = [where?.site_id?._eq];
    } else if (!where?.site_id && where?.district_ids?._in.length) {
      siteIds = (await this.findSitesByDistricts(where?.district_ids?._in)).map(
        (site) => site.id,
      );
    }

    if (!siteIds.length) {
      return result;
    }

    const availableStocks = await getAvailableStocks({
      site_ids: siteIds,
      move_in_date: dayJS().add(1, 'day').toDate(),
    });

    if (availableStocks?.length) {
      availableStocks.forEach((site) => {
        site.spaces.forEach((space) => {
          spaceIds.push(space.id);
        });
      });
    }

    if (!spaceIds?.length) {
      return result;
    }

    const spaceFilter = {
      platform_space_type_id: { _eq: typeId },
      id: { _in: spaceIds },
    };

    const whereSpaces: WhereOptions = toSequelizeComparator(spaceFilter);

    const { rows } = await this.spaceEntity.findAndCountAll({
      where: whereSpaces,
      limit: 1,
      offset: 0,
      include: [
        {
          model: PriceModel,
          required: true,
        },
      ],
      distinct: true,
      subQuery: false,
      order: this.getSpacesSortOrder(sortBy),
    });

    result.edges = (rows as undefined) as Space[];

    return result;
  }

  private getSpacesSortOrder(sortBy: ISpaceFindAllSort) {
    const order: Order = [];
    if (sortBy?.price) {
      order.push([
        { model: PriceModel, as: 'prices' },
        'price_per_month',
        sortBy.price,
      ]);
    }

    if (sortBy?.size) {
      order.push(['size', sortBy.size]);
    }

    if (!order.length) {
      order.push(['id', 'ASC']);
    }

    return order;
  }

  public async getLastStockAvailableDate(
    spaceId: number,
    availableUnits: number,
    totalUnits: number,
    moveInDate: Date,
  ): Promise<Date> {
    if (availableUnits <= 0) {
      return null;
    }

    const { edges: bookings } = await this.bookingService.findAll(
      { limit: 100, skip: 0 },
      {
        status: {
          _in: [
            BookingStatus.RESERVED,
            BookingStatus.CONFIRMED,
            BookingStatus.ACTIVE,
          ],
        },
        space_id: {
          _eq: spaceId,
        },
      },
    );

    const mergedBookings = this.mergeBookingsOfSpace(bookings);
    const currentBookedUnits = mergedBookings.length;

    // If space has 4 units in total and only 3 are booked, 1 unit can still be freely
    // booked, we return null for the stock available date
    if (totalUnits > currentBookedUnits) {
      return null;
    }

    // Otherwise we return that date of booking where move in date is greater than todays
    // By having this check, it'll discard bookings which are active (move in date passed already)
    const filtered = mergedBookings.filter(
      (b) => b.start > dayJS(moveInDate).toDate(),
    );
    const stockAvailableDate = filtered[filtered.length - 1]?.start;

    return stockAvailableDate
      ? dayJS(stockAvailableDate).utc(true).subtract(1, 'day').toDate()
      : null;
  }

  private checkStock(space: SpaceModel, filter: any) {
    return this.getStock(space) > filter._gt;
  }

  private getStock(space: SpaceModel): number {
    let stock = 0;
    if (space?.stock_management_type === StockManagementType.THIRD_PARTY) {
      stock = space.available_units;
    }

    if (space?.stock_management_type === StockManagementType.SND) {
      const units = space.total_units - space.bookings?.length;
      stock = isNaN(units) || units < 0 ? 0 : units;
    }

    return stock;
  }

  private mergeBookingsOfSpace(bookings: Booking[]): IMergeBookingResponse[] {
    // Bookings which doesn't have move out date will use next year as fake move out date
    const nextYear = new Date(new Date().setFullYear(2022));
    const mappedBookings = bookings.map((b) => ({
      start: new Date(b.move_in_date),
      end: b.move_out_date ? new Date(b.move_out_date) : nextYear,
    }));

    const timeline = mappedBookings.sort(
      (a, b) => (a.start as any) - (b.start as any),
    );

    for (let i = 0; i < timeline.length - 1; i++) {
      const current = timeline[i];
      const next = timeline[i + 1];

      if (current.end < next.start) {
        timeline[i] = {
          start: current.start,
          end: next.end,
        };
        timeline.splice(i + 1, 1); // delete entry since they overlap
      }
    }

    return timeline;
  }

  async findAllThirdPartyBySite(siteId: number): Promise<SpaceModel[]> {
    return this.spaceEntity.findAll({
      where: {
        site_id: siteId,
        status: {
          [Op.ne]: SpaceStatus.ARCHIVED,
        },
        third_party_space_id: {
          [Op.not]: null,
        },
      },
    });
  }

  public getActiveBookingsWhere(
    moveInDate: Date,
    moveOutDate: Date,
  ): WhereOptions {
    //
    const activeStatuses = [
      BookingStatus.ACTIVE,
      BookingStatus.CONFIRMED,
      BookingStatus.RESERVED,
    ];

    if (moveInDate && moveOutDate) {
      return {
        [Op.or]: [
          {
            status: { [Op.in]: activeStatuses },
            move_in_date: { [Op.lte]: moveInDate },
            [Op.or]: [
              {
                move_out_date: { [Op.gte]: moveInDate },
              },
              {
                move_out_date: { [Op.eq]: null },
              },
            ],
          },
          {
            status: { [Op.in]: activeStatuses },
            move_in_date: { [Op.lte]: moveOutDate },
            [Op.or]: [
              {
                move_out_date: { [Op.gte]: moveOutDate },
              },
              {
                move_out_date: { [Op.eq]: null },
              },
            ],
          },
          {
            status: { [Op.in]: activeStatuses },
            move_in_date: { [Op.gt]: moveInDate },
            move_out_date: { [Op.lt]: moveOutDate },
          },
        ],
      };
    }
    if (moveInDate) {
      return {
        status: { [Op.in]: activeStatuses },
        move_in_date: { [Op.lte]: moveInDate },
        [Op.or]: [
          {
            move_out_date: { [Op.gte]: moveInDate },
          },
          {
            move_out_date: { [Op.eq]: null },
          },
        ],
      };
    }

    return { status: { [Op.in]: activeStatuses } };
  }

  public async create(
    payload: ICreateSpacePayload,
    args: ICreateSpaceArgs,
  ): Promise<Space> {
    // check if the provided site id exists
    const site = await this.siteEntity.findByPk(payload?.site_id, {
      include: [
        {
          model: SiteAddressModel,
          include: [{ model: CountryModel }],
        },
      ],
    });
    if (!site) {
      throw NotFoundError('Site not found!');
    }
    const t = await this.sequelize.transaction();
    try {
      const size = payload.length * payload.width;
      if (!payload.platform_space_type_id) {
        const spaceType = await this.platformSpaceTypeService.getBySize(
          size,
          site?.address?.country_id,
        );
        payload.platform_space_type_id = spaceType?.id;
      }

      const formattedSize = parseFloat(
        (payload.size ? payload.size : size).toString(),
      ).toFixed(2);
      const space = await this.spaceEntity.create(
        {
          ...payload,
          stock_management_type:
            payload.stock_management_type || site.stock_management_type,
          size: formattedSize,
          user_id: args.user_id,
          created_by: args.user_id,
          updated_by: args.user_id,
        },
        { transaction: t },
      );

      const pricePayload: Partial<ISpacePriceEntity> = {
        space_id: space?.id,
        price_per_month: payload?.price_per_month,
        type: PriceType.BASE_PRICE,
        currency: site?.address?.country?.currency || args?.currency || 'SGD',
        currency_sign:
          site?.address?.country?.currency_sign || args?.currency_sign || 'S$',
      };
      await Promise.all([
        await this.priceService.create(pricePayload, {
          t,
        }),
        await this.spaceFeatureService.upsert(space?.id, payload?.features_id, {
          t,
        }),
      ]);
      await t.commit();
      return await this.getById(space?.id);
    } catch (error) {
      this.logger.error('Create Space Error: ', error?.stack);

      // rollback the transaction.
      await t.rollback();

      throw error;
    }
  }

  async update(
    id: number,
    payload: UpdateSpacePayload,
    args: ICreateSpaceArgs,
  ): Promise<UpdateSpaceResp> {
    const t = await this.sequelize.transaction();
    try {
      const space = await this.spaceEntity.findByPk(id, {
        include: [
          {
            model: SiteModel,
            include: [{ model: SiteAddressModel }],
          },
        ],
      });

      if (!space) {
        throw NotFoundError('Space not found!');
      }

      if (payload?.price_per_month) {
        await this.priceService.update(id, payload?.price_per_month, { t });
      }

      if (payload?.features_id) {
        await this.spaceFeatureService.upsert(id, payload?.features_id, {
          t,
        });
      }

      if (payload.length && payload.width) {
        const size = payload.length * payload.width;
        const spaceType = await this.platformSpaceTypeService.getBySize(
          size,
          space?.site?.address?.country_id,
        );
        (payload as any).size = parseFloat(size.toString()).toFixed(2);
        (payload as any).platform_space_type_id = spaceType?.id;
      }

      await this.spaceEntity.update(
        {
          ...payload,
          created_by: args.user_id,
          updated_by: args.user_id,
        },
        {
          where: { id: { [Op.eq]: id } },
          transaction: t,
        },
      );

      await t.commit();

      return {
        modified: 1,
        edges: [await this.getById(id)],
      };
    } catch (error) {
      this.logger.error('Update Space Error: ', error?.stack);

      // rollback the transaction.
      await t.rollback();

      throw error;
    }
  }

  async archive(ids: number[]): Promise<any> {
    return this.spaceEntity.update(
      {
        status: SpaceStatus.ARCHIVED,
      },
      {
        where: { id: { [Op.in]: ids } },
      },
    );
  }

  async delete(id: number, args: ICreateSpaceArgs): Promise<DeleteSpaceResp> {
    try {
      // check if space exists
      const space = await this.spaceEntity.findByPk(id);

      if (!space) {
        throw NotFoundError('Space not found!');
      }

      if (!args.isAdmin && space.user_id !== args.user_id) {
        throw ForbiddenError('Forbidden: You cannot remove this space');
      }

      if (space.status === SpaceStatus.ACTIVE) {
        throw ForbiddenError('Space cannot be deleted in Active status');
      }

      await space.destroy();
      return { success: true };
    } catch (error) {
      this.logger.error('Delete Space Error: ', error?.stack);

      throw error;
    }
  }
}
