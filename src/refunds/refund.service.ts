import { Inject, Injectable, Logger } from '@nestjs/common';
import { Sequelize, Transaction } from 'sequelize';

import { ITransactionEntity } from '../bookings/transactions/interfaces/transaction.interface';
import { TransactionService } from '../bookings/transactions/transaction.service';
import { RefundType, TransactionType } from '../graphql.schema';
import { IDCounterService } from '../ids_counter/ids_counter.service';
import {
  REFUND_REPOSITORY,
  SEQUELIZE_PROVIDER,
} from '../shared/constant/app.constant';
import { StripeService } from '../stripe/stripe.service';
import { ICreateRefundOptions } from './interfaces/refund.interface';
import { RefundModel } from './refund.model';

@Injectable()
export class RefundService {
  constructor(
    @Inject(REFUND_REPOSITORY)
    private readonly refundEntity: typeof RefundModel,
    private readonly stripeService: StripeService,
    private readonly idCounterService: IDCounterService,
    private readonly transactionService: TransactionService,
    private readonly logger: Logger,
    @Inject(SEQUELIZE_PROVIDER)
    private readonly sequelize: Sequelize,
  ) {
    this.logger.setContext(RefundService.name);
  }

  public async refund(
    payload: Partial<ICreateRefundOptions>,
    options: {
      stripe_customer_id: string;
      user_id: number;
    },
    args?: { t: Transaction },
  ): Promise<number> {
    let t = args?.t;

    if (!t) {
      t = await this.sequelize.transaction();
    }

    const record = await this.refundEntity.create(
      {
        booking_id: payload.bookingId,
        refunded_amount: payload.amount,
        penalty_percent: payload.penaltyPercent,
        type: payload.type,
      },
      {
        transaction: t,
      },
    );

    //
    const card = await this.stripeService.retrieveCard(
      options.stripe_customer_id,
    );
    const transactionShortId = await this.idCounterService.generateTransactionId();
    const invoiceId = await this.idCounterService.generateInvoiceId();
    let transactionType;
    switch (payload.type) {
      case RefundType.REFUND_CANCEL_BOOKING:
        transactionType = TransactionType.REFUND_CANCEL_BOOKING;
        break;
      case RefundType.REFUND_DEPOSIT:
        transactionType = TransactionType.REFUND_DEPOSIT;
        break;
      case RefundType.REFUND_UNUSED_DAYS:
        transactionType = TransactionType.REFUND_UNUSED_DAYS;
    }
    const transactionPayload: Partial<ITransactionEntity> = {
      stripe_charge_id: payload.chargeId,
      stripe_customer_id: options.stripe_customer_id,
      card_brand_name: card?.brand,
      card_last_digits: card?.last4,
      amount: payload.amount,
      currency: payload?.currency,
      booking_id: payload.bookingId,
      short_id: transactionShortId,
      invoice_id: invoiceId,
      type: transactionType,
      user_id: options?.user_id,
      refund_id: record.id,
    };

    await this.transactionService.create(transactionPayload, {
      t,
    });

    this.logger.log(`Start refund for stripeChargeId:  ${payload.chargeId}`);
    try {
      const res = await this.stripeService.refundWithAmount(
        payload.chargeId,
        this.stripeService.calculateAmountInCurrency(
          payload.amount,
          payload.currency,
        ),
      );

      record.stripe_refund_id = res.id;

      await record.save({ transaction: t });

      if (!args?.t) {
        await t.commit();
      }

      return record.id;
    } catch (e) {
      this.logger.error(
        `Error occurred while processing refund for booking ${payload.bookingId}`,
        e.stack,
      );

      if (!args?.t) {
        await t.rollback();
      }

      return null;
    }
  }
}
