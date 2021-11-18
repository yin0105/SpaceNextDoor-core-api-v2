import { Logger } from '@nestjs/common';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { Driver, PlatformService } from '../../graphql.schema';
import { GoGoxLogisticsService } from '../../logistics/providers/gogox/gogox.logistics.service';
import { Service } from '../../platform/services/service';
import { IOrderPickUpServiceEntity } from './interfaces/order-pick-up-service.interface';
@Resolver('OrderPickUpService')
export class OrderPickUpServiceResolver {
  constructor(
    private readonly service: Service,
    private readonly gogoxService: GoGoxLogisticsService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(OrderPickUpServiceResolver.name);
  }

  @ResolveField('service')
  async orderPickUpService(
    @Parent() orderPickUpService: IOrderPickUpServiceEntity,
  ): Promise<PlatformService> {
    return await this.service.getById(orderPickUpService?.service_id);
  }

  @ResolveField('driver')
  async driver(
    @Parent() orderPickUpService: IOrderPickUpServiceEntity,
  ): Promise<Driver> {
    const gogoxOrder = await this.gogoxService.getOrder(
      orderPickUpService?.third_party_tracking_id,
    );
    return {
      name: gogoxOrder?.courier?.name || '',
      phone: gogoxOrder?.courier?.phone_number || '',
    };
  }
}
