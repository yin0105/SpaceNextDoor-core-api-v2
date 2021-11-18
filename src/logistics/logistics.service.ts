import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { LogisticsPricePayload, LogisticsPriceResp } from '../graphql.schema';
import { PlatformServiceModel } from '../platform/services/service.model';
import { PlatformSpaceTypeModel } from '../platform/space-types/space-type.model';
import {
  PLATFORM_SERVICE_REPOSITORY,
  SPACE_REPOSITORY,
} from '../shared/constant/app.constant';
import { BadRequestError, NotFoundError } from '../shared/errors.messages';
import { SiteAddressModel } from '../sites/site-addresses/site-address.model';
import { SiteModel } from '../sites/sites/site.model';
import { SpaceModel } from '../spaces/spaces/space.model';
import {
  ILogistics,
  ILogisticsAdditionalRequirements,
  ILogisticsCreateOrderPayload,
  ILogisticsCreateOrderResp,
  ILogisticsDestination,
  ILogisticsPickUp,
} from './interfaces/logistics.interface';

@Injectable()
export class LogisticsService {
  private readonly SND_SERVICE_COMMISSION_PERCENT = 10;

  constructor(
    @Inject(SPACE_REPOSITORY)
    private spaceEntity: typeof SpaceModel,
    @Inject(PLATFORM_SERVICE_REPOSITORY)
    private serviceEntity: typeof PlatformServiceModel,
    private configService: ConfigService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(LogisticsService.name);
    this.SND_SERVICE_COMMISSION_PERCENT = this.configService.get(
      'app.constants.sndPickupCommissionPercent',
    );
  }

  public async cancelOrder(
    logistics: ILogistics,
    orderId: string,
  ): Promise<boolean> {
    return logistics.cancelOrder(orderId);
  }

  public async createOrder(
    logistics: ILogistics,
    payload: ILogisticsCreateOrderPayload,
  ): Promise<ILogisticsCreateOrderResp> {
    const logisticsOrder = await logistics.createOrder(
      {
        location: payload.customer.location,
        name: payload.customer.name,
        street_address: payload.customer.address,
        contact: {
          name: payload.customer.name,
          phone_number: payload.customer.phone,
        },
      },
      {
        location: payload.site.location,
        name: payload.site.name,
        street_address: payload.site.address,
        contact: {
          name: payload.site.name,
          phone_number: payload.site.phone,
        },
      },
      payload.scheduledAt,
      payload.vehicle,
      payload.extraRequirements,
    );
    // ADDING SND markup on top of service price
    logisticsOrder.amount =
      logisticsOrder.amount +
      (logisticsOrder.amount * this.SND_SERVICE_COMMISSION_PERCENT) / 100;
    logisticsOrder.amount = parseFloat(logisticsOrder.amount.toFixed(2));
    return logisticsOrder;
  }

  public async getPrice(
    logistics: ILogistics,
    payload: LogisticsPricePayload,
  ): Promise<LogisticsPriceResp> {
    const currentDate = new Date();

    if (new Date(payload?.schedule_at) <= currentDate) {
      throw BadRequestError(
        'schedule_at can not be less than or equal to current date',
      );
    }

    const [space, service] = await Promise.all([
      this.spaceEntity.findOne({
        where: { id: payload?.space_id },
        include: [
          PlatformSpaceTypeModel,
          { model: SiteModel, include: [{ model: SiteAddressModel }] },
        ],
      }),
      this.serviceEntity.findByPk(payload?.service_id),
    ]);

    if (!space) {
      throw NotFoundError('Space not found with this id!');
    }

    if (!service) {
      throw NotFoundError('Service not found with this id!');
    }

    if (
      !logistics.vehicleTypeValidate(
        space?.platform_space_type?.name_en,
        service?.vehicle_code,
      )
    ) {
      throw BadRequestError('Selected vehicle is too small!');
    }

    const destination: ILogisticsDestination = {
      lat: space?.site?.address?.lat,
      lng: space?.site?.address?.lng,
    };

    const pickUp: ILogisticsPickUp = {
      schedule_at: payload?.schedule_at,
      lat: payload?.pick_up?.lat,
      lng: payload?.pick_up?.lng,
    };

    const additionalRequirements: ILogisticsAdditionalRequirements = {
      mover_count: payload?.additional_requirements?.mover_count || 0,
    };

    const vehicle = service?.vehicle_code;

    const info = await logistics.getPrice(
      pickUp,
      destination,
      additionalRequirements,
      vehicle,
    );

    // ADDING SND markup on top of service price
    info.estimated_price.amount =
      info.estimated_price.amount +
      (info.estimated_price.amount * this.SND_SERVICE_COMMISSION_PERCENT) / 100;

    info.estimated_price.amount = parseFloat(
      info.estimated_price.amount.toFixed(2),
    );

    return info;
  }
}
