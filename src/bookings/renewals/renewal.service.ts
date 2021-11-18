import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import dayjs, { Dayjs } from 'dayjs';
import { Op, Transaction } from 'sequelize';

import { AppliedTaxService } from '../../applied-taxes/applied-tax.service';
import { BookingPromotionCustomerBuysModel } from '../../bookings/promotions/customer_buys/customer_buys.model';
import { BookingPromotionModel } from '../../bookings/promotions/promotion/promotion.model';
import {
  PaymentSchedulePayload,
  PaymentScheduleResp,
  PromotionBuyTypes,
  PromotionFormat,
  PromotionStatus,
  QuotationStatus,
  Renewal,
  RenewalStatus,
  RenewalType,
  ServiceType,
} from '../../graphql.schema';
import { OrderModel } from '../../orders/order.model';
import { OrderPickUpServiceModel } from '../../orders/pick_up_service/order-pick-up-service.model';
import { PlatformCommissionModel } from '../../platform/commissions/commission.model';
import { InsuranceService } from '../../platform/insurances/insurance.service';
import { Service } from '../../platform/services/service';
import { PromotionCustomerBuysModel } from '../../promotions/customer_buys/customer_buys.model';
import { IPromotionAmount } from '../../promotions/promotion/interfaces/promotion.interface';
import { PromotionModel } from '../../promotions/promotion/promotion.model';
import { PromotionService } from '../../promotions/promotion/promotion.service';
import { QuotationItemModel } from '../../quotations/models/quotation-item.model';
import { QuotationModel } from '../../quotations/models/quotation.model';
import {
  BOOKING_REPOSITORY,
  PROMOTION_REPOSITORY,
  QUOTATION_ITEM_REPOSITORY,
  RENEWAL_REPOSITORY,
  SPACE_REPOSITORY,
} from '../../shared/constant/app.constant';
import { BadRequestError } from '../../shared/errors.messages';
import { SiteModel } from '../../sites/sites/site.model';
import { PriceModel } from '../../spaces/prices/price.model';
import { SpaceModel } from '../../spaces/spaces/space.model';
import { BookingModel } from '../booking.model';
import { TransactionModel } from '../transactions/transaction.model';
import {
  IRenewalEntity,
  IRenewalPayload,
} from './interfaces/renewal.interface';
import { RenewalModel } from './renewal.model';

@Injectable()
export class RenewalService {
  private createRenewalDays: number;
  constructor(
    @Inject(RENEWAL_REPOSITORY)
    private readonly renewalEntity: typeof RenewalModel,
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingEntity: typeof BookingModel,
    @Inject(PROMOTION_REPOSITORY)
    private readonly promotionEntity: typeof PromotionModel,
    @Inject(SPACE_REPOSITORY)
    private readonly spaceEntity: typeof SpaceModel,
    @Inject(QUOTATION_ITEM_REPOSITORY)
    private readonly quotationItemEntity: typeof QuotationItemModel,
    private readonly logger: Logger,
    private readonly promotionService: PromotionService,
    private readonly insuranceService: InsuranceService,
    private readonly appliedTaxService: AppliedTaxService,
    private readonly service: Service,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(RenewalService.name);
    this.createRenewalDays = this.configService.get<number>(
      'app.renewal.createBefore',
    );
  }

  public async getByBookingId(bookingId: number): Promise<Renewal[]> {
    const result = await this.renewalEntity.findAll({
      where: { booking_id: bookingId },
      order: [['id', 'ASC']],
    });

    return (result as undefined) as Renewal[];
  }

  public async getByPaidDate(
    startDate: Date,
    endDate: Date,
  ): Promise<RenewalModel[]> {
    return this.renewalEntity.findAll({
      where: {
        renewal_paid_date: {
          [Op.gte]: startDate,
          [Op.lt]: endDate,
        },
        status: {
          [Op.eq]: RenewalStatus.PAID,
        },
      },
      include: [
        {
          model: BookingModel,
          include: [
            { model: SiteModel, include: [{ model: PlatformCommissionModel }] },
          ],
        },
        {
          model: TransactionModel,
        },
      ],
    });
  }

  async create(
    payload: Omit<
      IRenewalEntity,
      'id' | 'created_at' | 'updated_at' | 'transaction_id'
    >,
    args?: { t: Transaction },
  ): Promise<Renewal> {
    return (await this.renewalEntity.create(payload, {
      transaction: args?.t,
    })) as undefined;
  }

  getRenewalPayload(
    insurancePricePerDay: number,
    depositAmount: number,
    renewalStartDate: Date, // move in date in case of type is BOOKING
    nextRenewalDateOfLastRenewal: Date = null,
    bookingId: number,
    baseAmount: number,
    discountedAmount: number,
    status: RenewalStatus,
    type: RenewalType,
    transactionId?: number,
    moveOutDate?: Date,
  ): IRenewalPayload {
    let nextRenewalDate;
    let renewalEndDate;
    let amount = baseAmount;
    let nextRenewalSubTotal: number | null = null;

    //
    renewalEndDate = dayjs(dayjs(renewalStartDate).add(1, 'month'));

    if (!moveOutDate) {
      // if there is no move out date set then the next renewal date will be after 1 month
      nextRenewalDate = this.getNextRenewalDate(
        type,
        renewalStartDate,
        nextRenewalDateOfLastRenewal,
      );

      //
      nextRenewalSubTotal = amount;
    }

    if (moveOutDate) {
      const endDate = new Date(moveOutDate);
      const date1 = dayjs(renewalStartDate);
      const date2 = dayjs(moveOutDate);

      // calculate days between move in date and move out date
      const differenceInDays = date2.add(1, 'day').diff(date1, 'day');
      const differenceInMonths = date2.add(1, 'day').diff(date1, 'month');

      if (differenceInDays > 30) {
        nextRenewalDate = this.getNextRenewalDate(
          type,
          renewalStartDate,
          nextRenewalDateOfLastRenewal,
        );
      }

      // if days between move in date and move out date is less then 30 then calculate price based on only those days
      if (differenceInMonths <= 1) {
        nextRenewalDate = null;
        renewalEndDate = endDate;
        // Calculating days cannot be more than 30 days
        const totalDays = differenceInDays > 30 ? 30 : differenceInDays;
        amount = (baseAmount / 30) * totalDays;

        //
        nextRenewalSubTotal = null;
      }

      amount = parseFloat(amount.toFixed(2));

      /**
       * calculate projected sub total amount
       */

      const differenceInDaysProjected = date2
        .add(1, 'day')
        .diff(date1.add(1, 'month'), 'day');
      const differenceInMonthsProjected = date2
        .add(1, 'day')
        .diff(date1.add(1, 'month'), 'month');

      if (differenceInDaysProjected > 30) {
        nextRenewalSubTotal = baseAmount;
      }

      if (differenceInDaysProjected >= 1 && differenceInMonthsProjected <= 1) {
        // Calculating days cannot be more than 30 days
        const totalDays =
          differenceInDaysProjected > 30 ? 30 : differenceInDaysProjected;
        nextRenewalSubTotal = (baseAmount / 30) * totalDays;
      }
    }

    insurancePricePerDay = insurancePricePerDay * 30;
    discountedAmount = parseFloat(discountedAmount.toFixed(2));
    const subTotalAmount = parseFloat(amount.toFixed(2));
    const totalAmount = parseFloat(
      (
        subTotalAmount +
        depositAmount +
        insurancePricePerDay -
        discountedAmount
      ).toFixed(2),
    );

    if (nextRenewalSubTotal) {
      nextRenewalSubTotal = parseFloat(nextRenewalSubTotal.toFixed(2));
    }
    return {
      booking_id: bookingId,
      next_renewal_date: nextRenewalDate,
      deposit_amount: depositAmount,
      status,
      type,
      base_amount: parseFloat(baseAmount.toFixed(2)),
      transaction_id: transactionId || null,
      total_amount: totalAmount,
      sub_total_amount: subTotalAmount,
      discount_amount: discountedAmount,
      renewal_start_date: renewalStartDate,
      renewal_end_date: renewalEndDate,
      insurance_amount: insurancePricePerDay,
      total_tax_amount: 0,
      next_renewal_sub_total: nextRenewalSubTotal,
    };
  }

  public getNextRenewalDate(
    type: RenewalType,
    renewalStartDate: Date,
    nextRenewalDateOfLastRenewal: Date,
  ): Dayjs {
    if (type === RenewalType.BOOKING) {
      return dayjs(dayjs(renewalStartDate).add(1, 'month')).subtract(
        this.createRenewalDays,
        'day',
      );
    }

    return dayjs(dayjs(nextRenewalDateOfLastRenewal).add(1, 'month'));
  }

  async update(
    id: number,
    payload: Partial<IRenewalEntity>,
    args?: { t: Transaction },
  ): Promise<Renewal> {
    return (await this.renewalEntity.update(payload, {
      where: { id },
      transaction: args?.t,
    })) as undefined;
  }

  // eslint-disable-next-line complexity
  async paymentSchedule(
    bookingId: number = null,
    payload: PaymentSchedulePayload = null,
  ): Promise<PaymentScheduleResp[]> {
    let insurance;
    let pickUpService;

    if (!bookingId && !payload) {
      throw BadRequestError('Invalid parameters..');
    }

    // so we can show max number of payment schedule for promotion covered months
    let maxBuyDays = 0;

    let {
      move_out_date: moveOutDate,
      move_in_date: moveInDate,
      space_id: spaceId,
      insurance_id: insuranceId,
      pick_up_service_id: pickupServiceId,
      promo_code: promoCode,
      promotion_id: promoId,
    } = payload || {};

    const { quotation_item_id: quotationItemId } = payload || {};

    if (bookingId) {
      const booking = await this.bookingEntity.findByPk(bookingId, {
        include: [
          { model: OrderModel, include: [OrderPickUpServiceModel] },
          {
            model: BookingPromotionModel,
            include: [{ model: BookingPromotionCustomerBuysModel }],
          },
        ],
      });

      moveInDate = booking.move_in_date;
      moveOutDate = booking.move_out_date;
      spaceId = booking.space_id;
      insuranceId = booking.insurance_id;

      if (booking.orders?.length) {
        pickupServiceId = booking.orders.find(
          (order) => !!order.order_pick_up_service_id,
        ).order_pick_up_service?.service_id;
      }

      if (booking.promotions?.length) {
        booking.promotions.forEach((promotion) => {
          if (promotion.format === PromotionFormat.VOUCHER) {
            promoCode = promotion.code;
          } else if (promotion.format === PromotionFormat.PUBLIC) {
            promoId = promotion.promotion_id;
          }
        });
        maxBuyDays = this.calculateMaxBuysDays(booking.promotions);
      }
    } else if (!!promoId || !!promoCode) {
      const promotions = await this.fetchActivePromotions(promoId, promoCode);
      maxBuyDays = this.calculateMaxBuysDays(promotions);
    }

    // we only show payment schedule if public promo was applied
    if (!promoId) {
      return [];
    }

    const space = await this.spaceEntity.findByPk(spaceId, {
      include: [{ model: PriceModel }],
    });

    if (!space) {
      throw BadRequestError('Space not found with this id');
    }

    let spacePricePerMonth = space?.prices?.[0]?.price_per_month || 0;
    if (quotationItemId) {
      const quotationItem = await this.quotationItemEntity.findOne({
        where: {
          id: quotationItemId,
        },
        include: [
          {
            model: QuotationModel,
            where: {
              status: QuotationStatus.ACTIVE,
            },
          },
        ],
      });

      if (quotationItem) {
        spacePricePerMonth = quotationItem.price_per_month;
      }
    }

    if (insuranceId) {
      insurance = await this.insuranceService.getById(insuranceId);
    }

    if (pickupServiceId) {
      pickUpService = await this.service.getByIdAndType(
        pickupServiceId,
        ServiceType.PICK_UP,
      );
    }

    const renewalStartDates = [dayjs(moveInDate)];

    for (let m = 1; m < maxBuyDays / 30; m++) {
      renewalStartDates.push(dayjs(moveInDate).add(m, 'month').add(1, 'day'));
    }

    // in case move out date is before 6 months, so we don't calculate all 6 months schedule
    let isMoveOutDateCalculated = false;

    const schedules: PaymentScheduleResp[] = [];
    let month = 0;
    for (const startDate of renewalStartDates) {
      if (isMoveOutDateCalculated) {
        continue;
      }

      month++;
      let endDate = dayjs(startDate).add(1, 'month');

      if (moveOutDate && endDate.isAfter(dayjs(moveOutDate))) {
        endDate = dayjs(moveOutDate);
        isMoveOutDateCalculated = true;
      }

      const paymentSchedule = new PaymentScheduleResp();
      paymentSchedule.from_date = startDate.toDate();
      paymentSchedule.to_date = endDate.toDate();

      //
      let promotionInfo: IPromotionAmount = null;
      paymentSchedule.discounted_amount = 0;
      paymentSchedule.currency_sign = space?.prices?.[0]?.currency_sign;
      if (promoCode || promoId) {
        // promoCode (voucher code) only applies on first month
        if (month > 1) {
          promoCode = null;
        }

        promotionInfo = await this.promotionService.getPromotionAmount(
          space.site_id,
          spacePricePerMonth,
          moveInDate,
          moveOutDate,
          promoCode,
          promoId,
          month,
        );

        if (promotionInfo?.promotion || promotionInfo?.public_promotion) {
          paymentSchedule.applied_promotion = promotionInfo.promotion;
          paymentSchedule.discounted_amount = promotionInfo.discounted_amount;
        }
      }

      // get total days
      const days = endDate.diff(dayjs(startDate), 'day');

      let depositAmount = 0;
      const insuranceAmount = insurance?.price_per_day * 30 || 0;
      paymentSchedule.deposit_amount = 0;
      paymentSchedule.insurance_price = insuranceAmount;
      paymentSchedule.service_price = 0;
      if (moveOutDate && days < 30) {
        const subTotalAmount = (spacePricePerMonth / 30) * days;
        paymentSchedule.sub_total_amount = parseFloat(
          subTotalAmount.toFixed(2),
        );
        depositAmount = parseFloat(subTotalAmount.toFixed(2));
      } else {
        paymentSchedule.sub_total_amount = spacePricePerMonth;
        depositAmount = spacePricePerMonth;
      }

      if (month === 1) {
        paymentSchedule.deposit_amount = depositAmount;
        paymentSchedule.service_price = pickUpService?.fixed_price || 0;
      }

      // calculate tax
      const taxes = await this.appliedTaxService.calculateTax({
        site_id: space.site_id,
        insurance_id: insuranceId,
        pickup_service_id: pickupServiceId,
        space_price:
          promotionInfo.discounted_amount > 0
            ? paymentSchedule.sub_total_amount - promotionInfo.discounted_amount
            : paymentSchedule.sub_total_amount,
        insurance_price: paymentSchedule.insurance_price,
        pickup_service_price: paymentSchedule.service_price,
      });

      paymentSchedule.total_amount =
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        paymentSchedule.sub_total_amount +
        paymentSchedule.insurance_price +
        paymentSchedule.deposit_amount +
        paymentSchedule.service_price +
        taxes.totalTax -
        paymentSchedule.discounted_amount;

      paymentSchedule.total_amount = parseFloat(
        paymentSchedule.total_amount.toFixed(2),
      );
      //
      schedules.push(paymentSchedule);
    }

    return schedules;
  }

  private fetchActivePromotions = async (
    promoId: number = null,
    promoCode: string = null,
  ): Promise<PromotionModel[]> => {
    if (!promoId && !promoCode) {
      throw BadRequestError('Invalid parameters.');
    }

    const orPromo = [];
    if (promoId) {
      orPromo.push({
        format: { [Op.eq]: PromotionFormat.PUBLIC },
        id: { [Op.eq]: promoId },
      });
    }

    if (promoCode) {
      orPromo.push({
        format: { [Op.eq]: PromotionFormat.VOUCHER },
        code: { [Op.eq]: promoCode },
      });
    }

    /* eslint-disable no-invalid-this */
    return this.promotionEntity.findAll({
      where: {
        status: PromotionStatus.ACTIVE,
        start_date: { [Op.lte]: new Date() },
        end_date: { [Op.gte]: new Date() },
        [Op.or]: orPromo,
      },
      include: [{ model: PromotionCustomerBuysModel }],
    });
  };

  // TODO: get days after promotions was applied in case of "BookingPromotionModel"
  private calculateMaxBuysDays = (
    promotions: PromotionModel[] | BookingPromotionModel[],
  ): number => {
    let maxBuyDays = 0;
    promotions.forEach((promotion) => {
      promotion.customer_buys
        .filter((buys) => buys.type === PromotionBuyTypes.MIN_DAYS)
        .forEach((buys) => {
          if (buys.value > maxBuyDays) {
            maxBuyDays = buys.value;
          }
        });
    });

    return maxBuyDays;
  };
}
