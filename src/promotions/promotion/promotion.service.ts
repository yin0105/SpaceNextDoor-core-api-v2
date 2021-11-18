import { Inject, Injectable, Logger } from '@nestjs/common';
import dayjs from 'dayjs';
import { FindAndCountOptions, Op, Sequelize, WhereOptions } from 'sequelize';

import {
  ApplyPromotionInput,
  ApplyPromotionResponse,
  Pagination,
  PriceType,
  Promotion,
  PromotionBuyTypes,
  PromotionFormat,
  PromotionForType,
  PromotionInput,
  PromotionsFilter,
  PromotionsResp,
  PromotionsSort,
  PromotionStatus,
  PromotionType,
} from '../../graphql.schema';
import {
  PROMOTION_REPOSITORY,
  SEQUELIZE_PROVIDER,
  SITE_REPOSITORY,
  SPACE_REPOSITORY,
} from '../../shared/constant/app.constant';
import { BadRequestError, NotFoundError } from '../../shared/errors.messages';
import { hasMoreRec, initPagination } from '../../shared/utils';
import {
  toSequelizeComparator,
  toSequelizeSort,
} from '../../shared/utils/graphql-to-sequelize-comparator';
import { SiteAddressModel } from '../../sites/site-addresses/site-address.model';
import { SiteModel } from '../../sites/sites/site.model';
import { PriceModel } from '../../spaces/prices/price.model';
import { SpaceModel } from '../../spaces/spaces/space.model';
import { PromotionCustomerBuysModel } from '../customer_buys/customer_buys.model';
import { PromotionCustomerBuysService } from '../customer_buys/customer_buys.service';
import { PromotionCustomerGetsModel } from '../customer_gets/customer_gets.model';
import { PromotionCustomerGetsService } from '../customer_gets/customer_gets.service';
import { PromotionRedeemModel } from '../redeem/redeem.model';
import { PromotionRedeemService } from '../redeem/redeem.service';
import {
  ICreatePromotionArgs,
  IPromotionAmount,
} from './interfaces/promotion.interface';
import { PromotionModel } from './promotion.model';

@Injectable()
export class PromotionService {
  constructor(
    @Inject(SEQUELIZE_PROVIDER)
    private readonly sequelize: Sequelize,
    @Inject(PROMOTION_REPOSITORY)
    private readonly promotionEntity: typeof PromotionModel,
    @Inject(SPACE_REPOSITORY)
    private readonly spaceEntity: typeof SpaceModel,
    @Inject(SITE_REPOSITORY)
    private readonly siteEntity: typeof SiteModel,
    private readonly customerBuysService: PromotionCustomerBuysService,
    private readonly customerGetsService: PromotionCustomerGetsService,
    private readonly promotionRedeemService: PromotionRedeemService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(PromotionService.name);
  }

  async findAll(
    pagination: Pagination,
    where: PromotionsFilter,
    sort: PromotionsSort,
  ): Promise<PromotionsResp> {
    this.logger.setContext(PromotionService.name);
    this.logger.log(`findAll with payload where: ${JSON.stringify(where)}`);

    pagination = initPagination(pagination);
    const whereFilter: WhereOptions = toSequelizeComparator(where);

    if (where.site_id) {
      delete whereFilter.site_id;
    }

    const options: FindAndCountOptions = {
      where: whereFilter,
      limit: pagination.limit,
      offset: pagination.skip,
      order: toSequelizeSort(sort),
    };

    if (where?.site_id) {
      options.include = [
        {
          model: PromotionCustomerBuysModel,
          where: {
            site_ids: { [Op.contains]: [where?.site_id?._eq] },
          },
        },
      ];
    }

    const { count, rows } = await this.promotionEntity.findAndCountAll(options);

    const result = new PromotionsResp();
    const promotions = (rows as undefined) as Promotion[];

    result.edges = promotions;
    result.page_info = {
      ...pagination,
      total: count,
      has_more: hasMoreRec(count, pagination),
    };

    return result;
  }

  async getById(id: number, isPublic = false): Promise<Promotion> {
    if (isPublic) {
      return await this.promotionEntity.findOne({
        where: { id, format: PromotionFormat.PUBLIC },
      });
    }

    return await this.promotionEntity.findByPk(id);
  }

  async getByCode(code: string): Promise<Promotion> {
    const promotion = await this.promotionEntity.findOne({
      where: { code, format: PromotionFormat.VOUCHER },
    });
    return (promotion as undefined) as Promotion;
  }

  async create(
    payload: PromotionInput,
    args: ICreatePromotionArgs,
  ): Promise<Promotion> {
    const t = await this.sequelize.transaction();
    try {
      if (!payload.start_date) {
        payload.start_date = new Date();
      }

      //
      if (payload.code && payload.status === PromotionStatus.ACTIVE) {
        await this.checkDuplicateCode(payload.code);
      }

      //
      if (
        payload.format !== PromotionFormat.CODE &&
        payload.format !== PromotionFormat.VOUCHER
      ) {
        delete payload.code;
      }

      const promotion = await this.promotionEntity.create(
        {
          ...payload,
          created_by: args.user_id,
          updated_by: args.user_id,
        },
        { transaction: t },
      );

      const promises = [];

      if (payload.customer_buys) {
        promises.push(
          this.customerBuysService.create(payload.customer_buys, {
            t,
            promo_id: promotion.id,
          }),
        );
      }

      if (payload.customer_gets) {
        promises.push(
          this.customerGetsService.upsert(promotion.id, payload.customer_gets, {
            t,
          }),
        );
      }

      await Promise.all(promises);
      await t.commit();

      return this.getById(promotion.id);
    } catch (error) {
      this.logger.error('Create Promotion Error: ', error?.stack);

      // rollback the transaction.
      await t.rollback();

      throw error;
    }
  }

  async update(
    id: number,
    payload: PromotionInput,
    args: ICreatePromotionArgs,
  ): Promise<Promotion> {
    const t = await this.sequelize.transaction();
    try {
      const promotion = await this.promotionEntity.findByPk(id, {
        include: [PromotionCustomerBuysModel, PromotionCustomerGetsModel],
      });
      if (!promotion) {
        throw NotFoundError('Promotion not found');
      }

      //
      if (
        (payload.code || promotion.code) &&
        payload.status === PromotionStatus.ACTIVE
      ) {
        await this.checkDuplicateCode(
          payload.code || promotion.code,
          promotion.id,
        );
      }

      const promises = [];

      promises.push(
        this.promotionEntity.update(
          {
            ...payload,
            updated_by: args.user_id,
          },
          {
            where: {
              id: { [Op.eq]: id },
            },
            transaction: t,
          },
        ),
      );

      if (payload.customer_buys) {
        if (promotion.customer_buys.length) {
          promises.push(
            this.customerBuysService.update(
              promotion.customer_buys[0].id,
              payload.customer_buys,
              { t },
            ),
          );
        } else {
          promises.push(
            this.customerBuysService.create(payload.customer_buys, {
              t,
              promo_id: id,
            }),
          );
        }
      }

      if (payload.customer_gets) {
        promises.push(
          this.customerGetsService.upsert(id, payload.customer_gets, {
            t,
          }),
        );
      }

      await Promise.all(promises);
      await t.commit();

      return this.getById(promotion.id);
    } catch (error) {
      this.logger.error('Update Promotion Error: ', error?.stack);

      // rollback the transaction.
      await t.rollback();

      throw error;
    }
  }

  async applyPromotion(
    payload: ApplyPromotionInput,
  ): Promise<ApplyPromotionResponse> {
    const space = await this.spaceEntity.findOne({
      where: {
        id: { [Op.eq]: payload.space_id },
      },
      include: [
        {
          model: PriceModel,
          where: { type: PriceType.BASE_PRICE },
        },
      ],
    });

    if (!space) {
      throw NotFoundError('Space not found!');
    }

    return await this.getPromotionAmount(
      space.site_id,
      space?.prices[0]?.price_per_month,
      payload?.move_in_date,
      payload?.move_out_date,
      payload.code,
    );
  }

  /**
   * Apply promo while booking, on first month
   *
   * If(forMonth > 1 && wasPromoAppliedFirstMonth == true):
   * Means this function is being called for other than first month and first month promo was applied already
   * so we can bypass the "buyCheckPassed" condition
   */
  // eslint-disable-next-line complexity
  async getPromotionAmount(
    siteId: number,
    pricePerMonth: number, // space amount
    moveInDate: Date,
    moveOutDate: Date = null,
    voucherCode: string = null, // private/voucher promotions
    promotionId: number = null,
    forMonth = 1, // first month index
  ): Promise<IPromotionAmount> {
    let commitMonths = 0;
    const generalResponse: IPromotionAmount = {
      promotion: null,
      public_promotion: null,
      price_per_month: pricePerMonth,
      discounted_amount: 0,
      total: pricePerMonth,
      total_after_discount: pricePerMonth,
      min_commitment_months: commitMonths,
    };

    if (!voucherCode && !promotionId) {
      return generalResponse;
    }

    const site = await this.siteEntity.findByPk(siteId, {
      include: [SiteAddressModel],
    });

    let commitDays = 30; // 1 month
    if (moveOutDate) {
      const date1 = dayjs(moveInDate);
      const date2 = dayjs(moveOutDate);
      commitDays = date2.diff(date1, 'day') + 1;
      commitMonths = date2.diff(date1, 'month');
    }

    let amount = pricePerMonth;
    if (commitMonths < 1) {
      amount = (pricePerMonth / 30) * commitDays;
    }
    amount = parseFloat(amount.toFixed(2));

    // both PUBLIC and PRIVATE promotions can be applied same time, so add condition separately
    const orPromo = [];
    if (promotionId) {
      orPromo.push({
        format: { [Op.eq]: PromotionFormat.PUBLIC },
        id: { [Op.eq]: promotionId },
      });
    }

    if (voucherCode) {
      orPromo.push({
        format: { [Op.eq]: PromotionFormat.VOUCHER },
        code: { [Op.eq]: voucherCode },
      });
    }

    const where: WhereOptions = {
      status: PromotionStatus.ACTIVE,
      start_date: { [Op.lte]: new Date() },
      end_date: { [Op.gte]: new Date() },
      [Op.or]: orPromo,
    };

    let promotions = await this.promotionEntity.findAll({
      where,
      include: [
        { model: PromotionCustomerBuysModel },
        { model: PromotionCustomerGetsModel },
        { model: PromotionRedeemModel },
      ],
    });

    if (!promotions.length) {
      return generalResponse;
    }

    //
    promotions = this.getFilteredPromotions(promotions);

    let promo = null;
    let publicPromotion = null;
    let publicPromotionWillApply = null; //  will be applied in other than current month(in future)
    let discountedAmount = 0;
    for (const promotion of promotions) {
      if (
        !promotion?.customer_buys?.length ||
        !promotion?.customer_gets?.length ||
        (!!promotion.max && promotion.redeem.length >= promotion.max)
      ) {
        continue;
      }

      const customerBuys = promotion.customer_buys[0];
      const customerGets = promotion.customer_gets;
      const customerBuysInMonths = customerBuys.value / 30;

      // check if customer meets the criteria of what customer buys
      let buyCheckPassed = false;

      if (customerBuys.type === PromotionBuyTypes.MIN_DAYS) {
        if (!moveOutDate) {
          buyCheckPassed = true;
        } else if (
          customerBuys.value < 30 &&
          commitDays >= customerBuys.value
        ) {
          buyCheckPassed = true;
        } else if (
          customerBuys.value >= 30 &&
          commitMonths >= customerBuysInMonths
        ) {
          buyCheckPassed = true;
        }
      } else if (
        customerBuys.type === PromotionBuyTypes.MIN_PRICE &&
        amount >= customerBuys.value
      ) {
        buyCheckPassed = true;
      }

      // check if site id condition passed
      customerBuys.site_ids = customerBuys.site_ids || [];
      if (
        (buyCheckPassed &&
          promotion.format === PromotionFormat.PUBLIC &&
          !customerBuys.site_ids.includes(siteId)) ||
        (buyCheckPassed &&
          promotion.format === PromotionFormat.VOUCHER &&
          !customerBuys.country_ids?.includes(site?.address?.country_id))
      ) {
        buyCheckPassed = false;
      }

      let isPromoApplied = false;
      if (buyCheckPassed) {
        let promoDiscount = 0;
        // eslint-disable-next-line complexity
        customerGets.find((gets) => {
          let applyPromo = false;
          if (
            gets.for_type === PromotionForType.FIRST_MONTHS &&
            forMonth <= gets.for_value
          ) {
            applyPromo = true;
          } else if (gets.for_type === PromotionForType.RENEWAL_INDEX) {
            if (gets.for_value === forMonth) {
              applyPromo = true;
            } else {
              publicPromotionWillApply = promotion;
            }
          }

          if (applyPromo) {
            isPromoApplied = true;

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

            //
            if (
              !moveOutDate &&
              customerBuys.type === PromotionBuyTypes.MIN_DAYS
            ) {
              commitMonths = Math.max(
                parseFloat((customerBuys.value / 30).toFixed(1)),
                commitMonths,
              );
            }
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
        // eslint-disable-next-line @typescript-eslint/tslint/config
      } else {
        if (promotion.format === PromotionFormat.PUBLIC) {
          publicPromotion = null;
        } else {
          promo = null;
        }
      }
    }

    if (!promo && !publicPromotion && !publicPromotionWillApply) {
      return generalResponse;
    }

    // if both promotion were applied and discounted amount goes to negative
    // make it zero then
    discountedAmount = Math.max(discountedAmount, 0);

    // discounted amount shouldn't be greater than total rent, max discount is 100%
    discountedAmount = discountedAmount > amount ? amount : discountedAmount;

    const publicPromo = publicPromotion || publicPromotionWillApply;
    return {
      promotion: promo ? ((promo.toJSON() as undefined) as Promotion) : null,
      public_promotion: publicPromo
        ? ((publicPromo.toJSON() as undefined) as Promotion)
        : null,
      price_per_month: pricePerMonth,
      total: amount,
      discounted_amount: discountedAmount,
      total_after_discount: parseFloat((amount - discountedAmount).toFixed(2)),
      min_commitment_months: commitMonths,
    };
  }

  /**
   * Code cannot be duplicate with ACTIVE status
   * Can be duplicate if status is other than ACTIVE
   */
  private async checkDuplicateCode(
    code: string,
    id: number = null,
  ): Promise<void> {
    const where: WhereOptions = {
      status: { [Op.eq]: PromotionStatus.ACTIVE },
      code: { [Op.eq]: code },
    };

    if (id) {
      where.id = { [Op.ne]: id };
    }

    const promotion = await this.promotionEntity.findOne({ where });

    if (promotion) {
      throw BadRequestError('Promotion code already exists and active');
    }
  }

  private getFilteredPromotions(
    promotions: PromotionModel[],
  ): PromotionModel[] {
    // if there is no condition of double discount, simply pass this condition
    const promoWithDoubleDiscount = promotions.find(
      (promo) => promo.allow_double_discount === false,
    );
    if (!promoWithDoubleDiscount) {
      return promotions;
    }

    // give priority to voucher promotions, if it cannot apply with others, then use only that
    const privatePromotion = promotions.find(
      (promo) =>
        promo.format === PromotionFormat.VOUCHER &&
        promo.allow_double_discount === false,
    );
    if (privatePromotion) {
      return [privatePromotion];
    }

    // !INFO
    // we don't apply this check for public promotions for now, if we need it later we can add here

    return promotions;
  }
}
