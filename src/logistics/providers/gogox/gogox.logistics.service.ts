import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Axios, { AxiosResponse } from 'axios';

import {
  LogisticsEstimatedPrice,
  LogisticsEstimatedPriceBreakDown,
  LogisticsPriceResp,
} from '../../../graphql.schema';
import {
  CustomGraphQLError,
  InternalServerError,
} from '../../../shared/errors.messages';
import {
  ILogistics,
  ILogisticsAdditionalRequirements,
  ILogisticsCreateOrderResp,
  ILogisticsDestination,
  ILogisticsPickUp,
  SpaceType,
} from '../../interfaces/logistics.interface';
import {
  GogoxVehicleCapacity,
  GoGoxVehicleType,
  IGogoxOrderPayload,
  IGogoxOrderResp,
  IGogoxPricePayload,
  IGogoxPriceResp,
  ILocationPoint,
} from './interfaces/gogox.interface';
@Injectable()
export class GoGoxLogisticsService implements ILogistics {
  private gogoxClientId: string;
  private gogoxClientSecret: string;
  private gogoxApiUrl: string;

  constructor(
    private readonly logger: Logger,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(GoGoxLogisticsService.name);

    this.gogoxClientId = this.configService.get<string>('app.gogox.clientId');
    this.gogoxClientSecret = this.configService.get<string>(
      'app.gogox.clientSecret',
    );
    this.gogoxApiUrl = this.configService.get<string>('app.gogox.apiUrl');
  }

  vehicleTypeValidate(spaceType: string, vehicleCode: string): boolean {
    return this.vehicleCapacity()[vehicleCode]?.includes(spaceType);
  }

  vehicleCapacity(): GogoxVehicleCapacity {
    return {
      [GoGoxVehicleType.VAN]: ['XXS', 'XS'],
      [GoGoxVehicleType.LORRY10]: ['XXS', 'XS', 'S'],
      [GoGoxVehicleType.LORRY14]: ['XXS', 'XS', 'S', 'M'],
      [GoGoxVehicleType.LORRY24]: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
    };
  }

  getVehicleType(spaceType: string): string {
    switch (spaceType) {
      case SpaceType.XXS:
        return GoGoxVehicleType.VAN;
      case SpaceType.XS:
        return GoGoxVehicleType.VAN;
      case SpaceType.S:
        return GoGoxVehicleType.LORRY10;
      case SpaceType.M:
        return GoGoxVehicleType.LORRY14;
      case SpaceType.L:
        return GoGoxVehicleType.LORRY24;
      case SpaceType.XL:
        return GoGoxVehicleType.LORRY24;
      case SpaceType.XXL:
        return GoGoxVehicleType.LORRY24;
    }
  }

  async getAuth(): Promise<any> {
    return Axios.post(`${this.gogoxApiUrl}/oauth/token`, {
      grant_type: 'client_credentials',
      client_id: this.gogoxClientId,
      client_secret: this.gogoxClientSecret,
    });
  }

  async createOrder(
    pickup: ILocationPoint,
    dropOff: ILocationPoint,
    scheduledAt: Date,
    vehicle: GoGoxVehicleType,
    extraRequirements?: ILogisticsAdditionalRequirements,
  ): Promise<ILogisticsCreateOrderResp> {
    try {
      const auth = await this.getAuth();

      const payload: IGogoxOrderPayload = {
        vehicle_type: vehicle,
        payment_method: 'prepaid_wallet',
        pickup: {
          ...pickup,
          schedule_at: scheduledAt.getTime(),
        },
        destinations: [dropOff],
      };

      if (extraRequirements) {
        payload.extra_requirements = extraRequirements;
      }
      const resp = await Axios.post<any, AxiosResponse<IGogoxOrderResp>>(
        `${this.gogoxApiUrl}/transport/orders`,
        payload,
        {
          headers: {
            Authorization: `${auth?.data?.token_type} ${auth?.data?.access_token}`,
          },
        },
      );

      if (resp.status !== 201 && resp.status !== 200) {
        throw new CustomGraphQLError(
          'THIRD_PARTY_ORDER_FAILED',
          'Error occurred while creating order on 3rd party!',
        );
      }

      return {
        order_id: resp.data?.uuid,
        // Price returned from gogox is in cents
        amount: parseFloat((resp.data?.price?.amount / 100).toFixed(2)),
      };
    } catch (e) {
      this.logger.error(e, e.stack);
      throw new CustomGraphQLError(
        'THIRD_PARTY_ORDER_FAILED',
        'Error occurred while creating order on 3rd party!',
      );
    }
  }

  async cancelOrder(orderId: string): Promise<boolean> {
    const auth = await this.getAuth();

    const resp = await Axios.post(
      `${this.gogoxApiUrl}/transport/orders/${orderId}/cancel`,
      {},
      {
        headers: {
          Authorization: `${auth?.data?.token_type} ${auth?.data?.access_token}`,
        },
      },
    );

    if (resp.status !== 204) {
      throw new CustomGraphQLError(
        'THIRD_PARTY_ORDER_CANCELLATION_FAILED',
        `Error occurred while cancelling gogox order ${orderId}`,
      );
    }

    return true;
  }

  async getPrice(
    pickUp: ILogisticsPickUp,
    destination: ILogisticsDestination,
    additionalRequirements: ILogisticsAdditionalRequirements,
    vehicle: string,
  ): Promise<LogisticsPriceResp> {
    const scheduleAt = new Date(pickUp?.schedule_at);
    try {
      const auth = await this.getAuth();

      const payload: IGogoxPricePayload = {
        vehicle_type: vehicle,
        pickup: {
          location: {
            lat: pickUp?.lat,
            lng: pickUp?.lng,
          },
          schedule_at: scheduleAt.getTime(),
        },
        destinations: [
          { location: { lat: destination?.lat, lng: destination?.lng } },
        ],
        extra_requirements: {
          mover_count: additionalRequirements?.mover_count || null,
        },
      };

      if (!additionalRequirements?.mover_count) {
        delete payload.extra_requirements;
      }

      const quotationResp = await Axios.post<
        any,
        AxiosResponse<IGogoxPriceResp>
      >(`${this.gogoxApiUrl}/transport/quotations`, payload, {
        headers: {
          Authorization: `${auth?.data?.token_type} ${auth?.data?.access_token}`,
        },
      });

      if (quotationResp.status !== 200) {
        throw InternalServerError('Something went wrong!');
      }

      const logisticsPriceResp = new LogisticsPriceResp();
      const logisticsEstimatedPrice = new LogisticsEstimatedPrice();
      const estimatedPriceAmount =
        quotationResp?.data?.estimated_price.amount / 100;
      logisticsEstimatedPrice.amount = parseFloat(
        estimatedPriceAmount.toFixed(2),
      );
      logisticsEstimatedPrice.currency =
        quotationResp?.data?.estimated_price?.currency;
      logisticsPriceResp.estimated_price = logisticsEstimatedPrice;
      logisticsPriceResp.vehicle_type = quotationResp?.data?.vehicle_type.toUpperCase();

      const estimatedPricesBreakDown = quotationResp?.data?.estimated_price_breakdown.map(
        (estimatedPriceBreakDown) => {
          const logisticsEstimatedPriceBreakDown = new LogisticsEstimatedPriceBreakDown();
          const estimatedPriceBreakDownAmount =
            estimatedPriceBreakDown?.amount / 100;
          logisticsEstimatedPriceBreakDown.amount = parseFloat(
            estimatedPriceBreakDownAmount.toFixed(2),
          );
          logisticsEstimatedPriceBreakDown.key = estimatedPriceBreakDown?.key;
          logisticsEstimatedPriceBreakDown.quantity =
            estimatedPriceBreakDown?.quantity || null;

          return logisticsEstimatedPriceBreakDown;
        },
      );

      logisticsPriceResp.estimated_price_breakdown = estimatedPricesBreakDown;

      return logisticsPriceResp;
    } catch (error) {
      throw InternalServerError('Something went wrong!');
    }
  }

  async getOrder(orderId: string): Promise<IGogoxOrderResp> {
    const auth = await this.getAuth();
    const gogoxOrderResp = await Axios.get<IGogoxOrderResp>(
      `${this.gogoxApiUrl}/transport/orders/${orderId}`,
      {
        headers: {
          Authorization: `${auth?.data?.token_type} ${auth?.data?.access_token}`,
        },
      },
    );
    if (gogoxOrderResp.status !== 200) {
      throw InternalServerError('Something went wrong!');
    }
    return gogoxOrderResp.data;
  }
}
