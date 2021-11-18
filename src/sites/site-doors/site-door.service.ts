import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Axios, { AxiosResponse } from 'axios';
import { Op, WhereOptions } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import UserAgent from 'user-agents';

import { BookingModel } from '../../bookings/booking.model';
import {
  BookingStatus,
  DoorActionType,
  OpenSiteDoorResp,
  OpenSiteDoorWhere,
  Pagination,
  SiteDoor,
  SiteDoorsFilter,
  SiteDoorsResp,
  SiteDoorsSort,
} from '../../graphql.schema';
import {
  BOOKING_REPOSITORY,
  SEQUELIZE_PROVIDER,
  SITE_DOOR_HISTORY_REPOSITORY,
  SITE_DOOR_REPOSITORY,
} from '../../shared/constant/app.constant';
import {
  CustomGraphQLError,
  NotFoundError,
} from '../../shared/errors.messages';
import { hasMoreRec, initPagination } from '../../shared/utils';
import { toSequelizeSort } from '../../shared/utils/graphql-to-sequelize-comparator';
import {
  IOpenDoorPayload,
  IOpenDoorResp,
} from './interfaces/site-door.interface';
import { SiteDoorModel } from './site-door.model';
import { SiteDoorHistoryModel } from './site-doors-history/site-door-history.model';
@Injectable()
export class SiteDoorService {
  private doorControllerApiUrl: string;
  constructor(
    @Inject(SEQUELIZE_PROVIDER)
    private readonly sequelize: Sequelize,
    @Inject(SITE_DOOR_REPOSITORY)
    private readonly siteDoorEntity: typeof SiteDoorModel,
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingEntity: typeof BookingModel,
    @Inject(SITE_DOOR_HISTORY_REPOSITORY)
    private readonly siteDoorHistoryEntity: typeof SiteDoorHistoryModel,
    private readonly logger: Logger,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(SiteDoorService.name);
    this.doorControllerApiUrl = this.configService.get<string>(
      'app.doorController.apiUrl',
    );
  }

  public async listDoors(
    userId: number,
    pagination: Pagination,
    filter: SiteDoorsFilter,
    sort: SiteDoorsSort = {},
  ): Promise<SiteDoorsResp> {
    this.logger.setContext(SiteDoorService.name);
    this.logger.log(
      `List all booking's site doors where: ${JSON.stringify(filter)}`,
    );

    const where: WhereOptions = {
      id: { [Op.eq]: filter?.booking_id?._eq },
      customer_id: { [Op.eq]: userId },
      status: { [Op.eq]: BookingStatus.ACTIVE },
    };
    const booking = await this.bookingEntity.findOne({ where });

    if (!booking) {
      throw NotFoundError('Booking not found');
    }

    pagination = initPagination(pagination);
    const { count, rows } = await this.siteDoorEntity.findAndCountAll({
      where: { site_id: { [Op.eq]: booking.site_id } },
      limit: pagination.limit,
      offset: pagination.skip,
      order: toSequelizeSort(sort),
      include: [
        {
          model: SiteDoorHistoryModel,
          where: { booking_id: filter?.booking_id?._eq },
          required: false,
          separate: true,
          order: [['created_at', 'DESC']],
        },
      ],
    });

    const result = new SiteDoorsResp();
    result.edges = (rows as undefined) as SiteDoor[];
    result.page_info = {
      ...pagination,
      total: count,
      has_more: hasMoreRec(count, pagination),
    };

    return result;
  }

  public async openDoor(
    whereFilter: OpenSiteDoorWhere,
    userId: number,
    userIp: string,
  ): Promise<OpenSiteDoorResp> {
    this.logger.setContext(SiteDoorService.name);
    this.logger.log(
      `Open site doors with payload: ${JSON.stringify(whereFilter)}
      And IP Address is ${userIp} and User Identity is ${userId}
      `,
    );

    try {
      let booking: BookingModel;
      if (whereFilter?.booking_id) {
        const where: WhereOptions = {
          id: { [Op.eq]: whereFilter?.booking_id?._eq },
          customer_id: { [Op.eq]: userId },
          status: { [Op.eq]: BookingStatus.ACTIVE },
        };
        booking = await this.bookingEntity.findOne({ where });

        if (!booking) {
          throw NotFoundError('Booking not found');
        }
      }

      const whereDoor: WhereOptions = {
        door_id: { [Op.eq]: whereFilter?.door_id?._eq },
        provider_id: { [Op.eq]: whereFilter?.provider_id?._eq },
      };

      if (booking) {
        whereDoor.site_id = { [Op.eq]: booking.site_id };
      }

      const door = await this.siteDoorEntity.findOne({
        where: whereDoor,
      });

      if (!door) {
        throw NotFoundError('Door not found with provided information');
      }

      const doorPayload: IOpenDoorPayload = {
        door_id: whereFilter.door_id?._eq,
        provider_id: whereFilter.provider_id?._eq,
      };

      const resp = await Axios.post<any, AxiosResponse<IOpenDoorResp>>(
        `${this.doorControllerApiUrl}/open-door`,
        doorPayload,
      );

      this.logger.log(
        `Logging response from doorController API: ${JSON.stringify(
          resp?.data,
        )}`,
      );

      if (resp?.data?.status !== 'success') {
        throw new CustomGraphQLError(
          'SITE_DOOR_CONTROLLER_ERROR',
          `Error from controller: ${resp?.data?.message}`,
        );
      }

      const userAgent = new UserAgent();
      const doorAction = resp?.data?.message.includes('open')
        ? DoorActionType.OPEN
        : DoorActionType.CLOSE;

      await this.siteDoorHistoryEntity.create({
        site_door_id: door?.id,
        booking_id: booking.id,
        action: doorAction,
        user_id: userId,
        user_ip: userIp,
        user_agent: userAgent?.data?.userAgent,
        platform: userAgent?.data?.platform,
        user_device: userAgent?.data?.deviceCategory,
      });

      return {
        is_open: true,
        status: resp?.data?.status,
        message: resp?.data?.message,
      };
    } catch (e) {
      this.logger.error(e, e.stack);
      throw e;
    }
  }
}
