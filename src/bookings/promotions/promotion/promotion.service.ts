import { Inject, Injectable, Logger } from '@nestjs/common';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { Op, Sequelize, Transaction } from 'sequelize';

import {
  Promotion,
  PromotionFormat,
  PromotionForType,
  PromotionStatus,
  PromotionType,
} from '../../../graphql.schema';
import { PromotionCustomerBuysModel } from '../../../promotions/customer_buys/customer_buys.model';
import { PromotionCustomerGetsModel } from '../../../promotions/customer_gets/customer_gets.model';
import { PromotionModel } from '../../../promotions/promotion/promotion.model';
import {
  BOOKING_PROMOTION_REPOSITORY,
  PROMOTION_REPOSITORY,
  SEQUELIZE_PROVIDER,
} from '../../../shared/constant/app.constant';
import { BookingModel } from '../../booking.model';
import { RenewalModel } from '../../renewals/renewal.model';
import { BookingPromotionCustomerBuysModel } from '../customer_buys/customer_buys.model';
import { BookingPromotionCustomerBuysService } from '../customer_buys/customer_buys.service';
import { BookingPromotionCustomerGetsModel } from '../customer_gets/customer_gets.model';
import { BookingPromotionCustomerGetsService } from '../customer_gets/customer_gets.service';
import {
  IBookingPromotion,
  IBookingPromotionAmount,
  IPromotionEntity,
} from './interfaces/promotion.interface';
import { BookingPromotionModel } from './promotion.model';
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

@Injectable()
export class BookingPromotionService {
  constructor(
    @Inject(SEQUELIZE_PROVIDER)
    private readonly sequelize: Sequelize,
    @Inject(PROMOTION_REPOSITORY)
    private readonly promotionEntity: typeof PromotionModel,
    @Inject(BOOKING_PROMOTION_REPOSITORY)
    private readonly bookingPromotionEntity: typeof BookingPromotionModel,
    private readonly customerBuysService: BookingPromotionCustomerBuysService,
    private readonly customerGetsService: BookingPromotionCustomerGetsService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(BookingPromotionService.name);
  }

  async getById(id: number): Promise<IBookingPromotion> {
    const promotion = await this.bookingPromotionEntity.findByPk(id, {
      include: [
        BookingPromotionCustomerGetsModel,
        BookingPromotionCustomerBuysModel,
        PromotionModel,
      ],
    });
    return (promotion as undefined) as IBookingPromotion;
  }

  async getByBookingId(bookingId: number): Promise<IBookingPromotion> {
    const promotion = await this.bookingPromotionEntity.findOne({
      where: {
        booking_id: { [Op.eq]: bookingId },
        format: { [Op.eq]: PromotionFormat.PUBLIC },
      },
      include: [
        BookingPromotionCustomerGetsModel,
        BookingPromotionCustomerBuysModel,
        PromotionModel,
      ],
    });
    return (promotion as undefined) as IBookingPromotion;
  }

  async create(
    promotionId: number,
    args: { t: Transaction; booking_id: number; applied_at: Date },
  ): Promise<Promotion> {
    try {
      let promotion = await this.promotionEntity.findByPk(promotionId);
      promotion = (promotion.toJSON() as undefined) as PromotionModel;

      /* eslint-disable @typescript-eslint/no-unused-vars */
      const { id, created_at, updated_at, ...rest } = promotion;
      return await this.bookingPromotionEntity.create(
        {
          ...rest,
          promotion_id: promotionId,
          booking_id: args.booking_id,
          applied_at: args?.applied_at,
        },
        { transaction: args?.t },
      );
    } catch (error) {
      this.logger.error('Create Booking Promotion Error: ', error?.stack);
      throw error;
    }
  }

  async createBuysGets(
    promotionId: number,
    args: { t: Transaction; promotion_id: number },
  ): Promise<any> {
    try {
      let promotion = await this.promotionEntity.findByPk(promotionId, {
        include: [PromotionCustomerGetsModel, PromotionCustomerBuysModel],
      });
      promotion = (promotion.toJSON() as undefined) as PromotionModel;
      const promises = [];

      if (promotion.customer_buys) {
        const buys = promotion.customer_buys.map((buy) => {
          /* eslint-disable @typescript-eslint/no-unused-vars */
          const { id, ...rest } = buy;
          return { ...rest, booking_promotion_id: args.promotion_id };
        });

        promises.concat(
          await this.customerBuysService.create(buys, {
            t: args?.t,
            promo_id: args.promotion_id,
          }),
        );
      }

      if (promotion.customer_gets) {
        const gets = promotion.customer_gets.map((get) => {
          /* eslint-disable @typescript-eslint/no-unused-vars */
          const { id, ...rest } = get;
          return { ...rest, booking_promotion_id: args.promotion_id };
        });

        promises.concat(
          await this.customerGetsService.create(gets, {
            t: args?.t,
            promo_id: args.promotion_id,
          }),
        );
      }

      return promises;
    } catch (error) {
      this.logger.error(
        'Create Booking Promotion Buys/Gets Error: ',
        error?.stack,
      );
      throw error;
    }
  }

  /**
   * On renewals, we only apply PUBLIC site promotions,
   * If voucher codes(private) promotions was applied,
   * We won't use that on renewals
   */
  async getBookingPromotionAmount(
    pricePerMonth: number, // space amount
    booking: BookingModel,
    renewalMonth: number = null,
    renewals: RenewalModel[] = [],
  ): Promise<IBookingPromotionAmount> {
    let commitDays = 30;
    let commitMonths = 0;
    if (booking?.move_out_date) {
      const date1 = dayjs(new Date());
      const date2 = dayjs(booking?.move_out_date);
      commitDays = date2.diff(date1, 'day') + 1;
      commitMonths = date2.diff(date1, 'month');
    }

    let amount = pricePerMonth;
    if (commitMonths < 1) {
      amount = (pricePerMonth / 30) * commitDays;
    }
    amount = parseFloat(amount.toFixed(2));

    // TODO: Apply voucher one too
    const promotions = await this.bookingPromotionEntity.findAll({
      where: {
        booking_id: booking.id,
        // format: { [Op.eq]: PromotionFormat.PUBLIC },
        status: PromotionStatus.ACTIVE,
        start_date: { [Op.lte]: new Date() },
        end_date: { [Op.gte]: new Date() },
      },
      include: [
        { model: BookingPromotionCustomerBuysModel },
        { model: BookingPromotionCustomerGetsModel },
        { model: BookingModel, include: [{ model: RenewalModel }] },
      ],
    });

    let promo = null;
    let publicPromotion = null;
    let discountedAmount = 0;
    for (const promotion of promotions) {
      if (
        !promotion?.customer_buys?.length ||
        !promotion?.customer_gets?.length
      ) {
        continue;
      }

      //
      // check if voucher code can be applied
      if (promotion.format === PromotionFormat.VOUCHER) {
        if (!renewals?.length) {
          continue;
        }

        const lastRenewal = renewals[renewals.length - 1];
        const isVoucherAppliedAlready = renewals.find((r) => {
          // TODO: Verify this condition
          if (
            r.promotion_id === promotion.id ||
            dayjs(lastRenewal.next_renewal_date).isBefore(
              dayjs(promotion.applied_at),
              'day',
            ) ||
            dayjs(lastRenewal.next_renewal_date)
              .add(1, 'month')
              .isAfter(dayjs(promotion.applied_at))
          ) {
            return true;
          }
        });
        if (isVoucherAppliedAlready) {
          continue;
        }
      }

      // calculate how many renewal months are passed after promotions was applied
      // AND +1 to it, for new renewal we're going to apply promotion on
      if (!renewalMonth) {
        renewalMonth =
          renewals.filter((renewal) =>
            dayjs(renewal.renewal_start_date).isSameOrAfter(
              dayjs(promotion.applied_at),
              'day',
            ),
          ).length + 1;
      }
      const customerGets = promotion.customer_gets;

      let appliedPromotion;
      let isPromoApplied = false;
      let promoDiscount = 0;
      customerGets.find((gets) => {
        let applyPromo = false;
        if (
          gets.for_type === PromotionForType.FIRST_MONTHS &&
          renewalMonth <= gets.for_value
        ) {
          applyPromo = true;
        } else if (
          gets.for_type === PromotionForType.RENEWAL_INDEX &&
          gets.for_value === renewalMonth
        ) {
          applyPromo = true;
        }

        if (applyPromo) {
          isPromoApplied = true;
          appliedPromotion = promotion;

          //
          if (promotion.format === PromotionFormat.PUBLIC) {
            publicPromotion = promotion;
          } else {
            promo = promotion;
          }

          switch (gets.type) {
            case PromotionType.FIXED_AMOUNT_DISCOUNT:
              promoDiscount += gets.value;
              break;
            case PromotionType.PERCENTAGE_DISCOUNT:
              promoDiscount += (amount * gets.value) / 100;
              break;
            case PromotionType.TOTAL_AMOUNT:
              promoDiscount += amount - gets.value;
          }

          //
          if (gets.max_amount_per_booking) {
            promoDiscount =
              promoDiscount > gets.max_amount_per_booking
                ? gets.max_amount_per_booking
                : promoDiscount;
          }

          //
          promoDiscount = parseFloat(promoDiscount.toFixed(2));
          // eslint-disable-next-line @typescript-eslint/tslint/config
        } else {
          if (promotion.format === PromotionFormat.PUBLIC) {
            publicPromotion = isPromoApplied ? promotion : null;
          } else {
            promo = isPromoApplied ? promotion : null;
          }
        }
      });

      discountedAmount = parseFloat(
        (promoDiscount + discountedAmount).toFixed(2),
      );
    }

    if (!promo && !publicPromotion) {
      return {
        promotion: null,
        public_promotion: null,
        price_per_month: pricePerMonth,
        discounted_amount: 0,
        total: amount,
        total_after_discount: amount,
      };
    }

    // if both promotion were applied and discounted amount goes to negative
    // make it zero then
    discountedAmount = Math.max(discountedAmount, 0);

    // discounted amount shouldn't be greater than total rent, max discount is 100%
    discountedAmount = discountedAmount > amount ? amount : discountedAmount;

    return {
      promotion: promo
        ? ((promo.toJSON() as undefined) as IPromotionEntity)
        : null,
      public_promotion: publicPromotion
        ? ((publicPromotion.toJSON() as undefined) as IPromotionEntity)
        : null,
      price_per_month: pricePerMonth,
      total: amount,
      discounted_amount: discountedAmount,
      total_after_discount: amount - discountedAmount,
    };
  }
}
