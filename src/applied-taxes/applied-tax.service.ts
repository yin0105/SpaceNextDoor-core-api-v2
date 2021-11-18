import { Inject, Injectable, Logger } from '@nestjs/common';
import { Op, Sequelize, Transaction } from 'sequelize';

import { ICalculateTaxArgs } from '../bookings/interfaces/booking.interface';
import { EntityTaxModel } from '../entity-taxes/entity-tax.model';
import {
  AppliedTax,
  CheckoutAppliedTax,
  TaxEntityType,
  TaxType,
} from '../graphql.schema';
import { PlatformTaxModel } from '../platform/taxes/tax.model';
import {
  APPLIED_TAX_REPOSITORY,
  ENTITY_TAX_REPOSITORY,
  PLATFORM_TAX_REPOSITORY,
  SEQUELIZE_PROVIDER,
} from '../shared/constant/app.constant';
import { AppliedTaxModel } from './applied-tax.model';
import {
  IAppliedTaxPayload,
  ICalculateTexResp,
} from './interfaces/applied-tax.interface';

@Injectable()
export class AppliedTaxService {
  constructor(
    @Inject(SEQUELIZE_PROVIDER)
    private readonly sequelize: Sequelize,
    @Inject(PLATFORM_TAX_REPOSITORY)
    private readonly taxEntity: typeof PlatformTaxModel,
    @Inject(APPLIED_TAX_REPOSITORY)
    private readonly appliedTaxEntity: typeof AppliedTaxModel,
    @Inject(ENTITY_TAX_REPOSITORY)
    private readonly entityTaxEntity: typeof EntityTaxModel,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(AppliedTaxService.name);
  }

  async create(
    payload: IAppliedTaxPayload[],
    args: { t: Transaction; userId: number },
  ): Promise<any[]> {
    try {
      if (payload.length <= 0) {
        return [];
      }
      const promises = [];
      const ids = payload.map((tax) => tax.tax_id);
      const taxes = await this.taxEntity.findAll({
        where: { id: { [Op.in]: ids } },
      });

      taxes.forEach((tax) => {
        tax = (tax.toJSON() as undefined) as PlatformTaxModel;
        const taxPayload = payload.find((data) => data.tax_id === tax.id);
        /* eslint-disable @typescript-eslint/no-unused-vars */
        const { id, created_at, updated_at, ...rest } = tax;
        promises.push(
          this.appliedTaxEntity.create(
            {
              ...rest,
              ...taxPayload,
              created_by: args?.userId,
              updated_by: args?.userId,
            },
            { transaction: args?.t },
          ),
        );
      });

      return promises;
    } catch (error) {
      this.logger.error('Create Applied Tax Error: ', error?.stack);
      throw error;
    }
  }

  public async calculateTax(
    args: ICalculateTaxArgs,
  ): Promise<ICalculateTexResp> {
    const checkoutTaxes: CheckoutAppliedTax[] = [];
    let totalTax = 0;

    const whereOr = [];
    if (args.site_id) {
      whereOr.push({ site_id: { [Op.eq]: args.site_id } });
    }

    if (args.insurance_id) {
      whereOr.push({ insurance_id: { [Op.eq]: args.insurance_id } });
    }

    if (args.pickup_service_id) {
      whereOr.push({ service_id: { [Op.eq]: args.pickup_service_id } });
    }

    const entityTaxes = await this.entityTaxEntity.findAll({
      where: { [Op.or]: whereOr },
      include: [{ model: PlatformTaxModel }],
    });

    entityTaxes.forEach((entityTax) => {
      const checkoutTax: CheckoutAppliedTax = {
        id: entityTax.tax_id,
        name_en: entityTax.tax.name_en,
        name_th: entityTax.tax.name_th,
        name_jp: entityTax.tax.name_jp,
        name_kr: entityTax.tax.name_kr,
        type: entityTax.tax.type,
        value: entityTax.tax.value,
        entity_type: entityTax.tax.entity_type,
        amount: 0,
      };

      let taxAmount = 0;
      let entityAmount = 0;

      switch (entityTax.tax?.entity_type) {
        case TaxEntityType.SITE:
          entityAmount = args.space_price;
          break;
        case TaxEntityType.INSURANCE:
          entityAmount = args.insurance_price;
          break;
        case TaxEntityType.SERVICE:
          entityAmount = args.pickup_service_price;
      }

      if (entityTax.tax?.type == TaxType.PERCENTAGE) {
        taxAmount = parseFloat(
          ((entityAmount / 100) * entityTax.tax?.value).toFixed(2),
        );
      } else if (entityTax.tax?.type == TaxType.ABSOLUTE) {
        taxAmount = entityTax.tax?.value;
      }

      checkoutTax.amount = taxAmount;

      totalTax += checkoutTax.amount;

      if (checkoutTax.amount > 0) {
        checkoutTaxes.push(checkoutTax);
      }
    });

    return {
      totalTax: parseFloat(totalTax.toFixed(2)),
      taxes: checkoutTaxes,
    };
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public async createAppliedTaxes(
    taxes: CheckoutAppliedTax[],
    bookingId: number,
    args: {
      t: Transaction;
      userId: number;
      orderPickUpServiceId?: number;
      orderId?: number;
      renewalId?: number;
      insuranceId?: number;
    },
  ) {
    const {
      orderPickUpServiceId,
      orderId,
      userId,
      renewalId,
      insuranceId,
      t,
    } = args;

    // add into taxes
    const appliedTaxPayload: IAppliedTaxPayload[] = taxes.map((tax) => ({
      tax_id: tax.id,
      tax_amount: tax.amount,
      booking_id: bookingId,
      renewal_id: renewalId,
      insurance_id: insuranceId,
      order_pickup_service_id: orderPickUpServiceId,
      order_id: orderId,
    }));

    const promises = await this.create(appliedTaxPayload, {
      t,
      userId,
    });
    await Promise.all(promises);
  }

  public async getByBookingId(id: number): Promise<AppliedTax[]> {
    return this.appliedTaxEntity.findAll({
      where: {
        booking_id: id,
      },
      include: [PlatformTaxModel],
    });
  }

  public async deleteByIds(ids: number[]): Promise<any> {
    return this.appliedTaxEntity.destroy({
      where: {
        id: { [Op.in]: ids },
      },
    });
  }
}
