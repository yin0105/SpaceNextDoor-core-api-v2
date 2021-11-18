import { Inject, Injectable, Logger } from '@nestjs/common';
import { Op, Transaction } from 'sequelize';

import { UserModel } from '../auth/users/user.model';
import { BookingModel } from '../bookings/booking.model';
import { RenewalModel } from '../bookings/renewals/renewal.model';
import { TransactionModel } from '../bookings/transactions/transaction.model';
import {
  Payout,
  PayoutStatus,
  UpdatePayoutFilter,
  UpdatePayoutPayload,
  UpdatePayoutResp,
} from '../graphql.schema';
import { PAYOUT_REPOSITORY } from '../shared/constant/app.constant';
import { BadRequestError, NotFoundError } from '../shared/errors.messages';
import { SMSNames, smsTemplateT } from '../shared/mailer/email-templates';
import { NotificationService } from '../shared/notifications/notification.service';
import { IPayoutEntity } from './interfaces/payout.interface';
import { PayoutModel } from './payout.model';
@Injectable()
export class PayoutService {
  private readonly notificationService: NotificationService;

  constructor(
    @Inject(PAYOUT_REPOSITORY)
    private readonly payoutEntity: typeof PayoutModel,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(PayoutService.name);
    this.notificationService = new NotificationService();
  }

  public async create(
    payload: Partial<IPayoutEntity>,
    args: { t: Transaction },
  ): Promise<Payout> {
    return (this.payoutEntity.create(payload, {
      transaction: args?.t,
    }) as unknown) as Payout;
  }

  public async update(
    payload: UpdatePayoutPayload,
    where: UpdatePayoutFilter,
  ): Promise<UpdatePayoutResp> {
    const payout = await this.payoutEntity.findByPk(where?.id?._eq, {
      include: [
        { model: RenewalModel, include: [{ model: TransactionModel }] },
        { model: BookingModel },
        { model: UserModel },
      ],
    });

    if (!payout) {
      throw NotFoundError('Payout not found!');
    }

    if (payload?.status === PayoutStatus.PENDING) {
      throw BadRequestError('Status can not be pending');
    }

    const notificationTemplate = smsTemplateT(
      SMSNames.HOST_PAYOUT,
      payout?.provider?.preferred_language,
    )({
      amount: payout?.amount,
      currency: payout?.currency,
      spaceId: payout?.booking?.space_id,
      shortId: payout?.booking_id,
      renewal_start_date: payout?.renewal?.renewal_start_date,
      renewal_end_date: payout?.renewal?.renewal_end_date,
    });

    const providerPhoneNumber = payout?.provider?.phone_number || null;

    try {
      const [modified, payouts] = await this.payoutEntity.update(payload, {
        where: { id: { [Op.eq]: where?.id?._eq } },
        returning: true,
      });

      if (providerPhoneNumber) {
        await this.notificationService.sendSMS(
          providerPhoneNumber,
          notificationTemplate,
        );
      }

      const updatePayoutResp = new UpdatePayoutResp();
      updatePayoutResp.edges = (payouts as unknown) as Payout[];
      updatePayoutResp.modified = modified;

      return updatePayoutResp;
    } catch (e) {
      this.logger.error('Update Payout Error:', e?.stack);

      throw e;
    }
  }
}
