import { Inject, Injectable, Logger } from '@nestjs/common';

import { AppliedTaxModel } from '../applied-taxes/applied-tax.model';
import { BookingModel } from '../bookings/booking.model';
import { RenewalModel } from '../bookings/renewals/renewal.model';
import { RenewalService } from '../bookings/renewals/renewal.service';
import { TransactionModel } from '../bookings/transactions/transaction.model';
import {
  CustomerDetails,
  CustomerInvoice,
  CustomerInvoiceFilter,
  InvoiceItems,
} from '../graphql.schema';
import { OrderModel } from '../orders/order.model';
import { OrderPickUpServiceModel } from '../orders/pick_up_service/order-pick-up-service.model';
import { PlatformInsuranceModel } from '../platform/insurances/insurance.model';
import { PlatformTaxModel } from '../platform/taxes/tax.model';
import { TRANSACTION_REPOSITORY } from '../shared/constant/app.constant';
import { NotFoundError } from '../shared/errors.messages';
import { getTranslatedName } from '../shared/lang.messages';

@Injectable()
export class InvoiceService {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionEntity: typeof TransactionModel,
    private readonly renewalService: RenewalService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(InvoiceService.name);
  }

  getInvoiceItems(
    transaction: TransactionModel,
    language?: string,
  ): InvoiceItems[] {
    const renewal = transaction?.booking?.renewals?.[0] || null;
    const items = [];

    if (renewal) {
      const name = `${transaction?.booking?.site_name} ${transaction?.booking?.space_size}${transaction?.booking?.space_size_unit}`;
      items.push({
        name,
        qty: 1,
        discount: renewal?.discount_amount,
        amount: renewal?.sub_total_amount,
        currency: transaction?.currency,
        currency_sign: transaction?.booking?.currency_sign,
      });
    }

    if (transaction?.order?.order_pick_up_service) {
      const name = 'Pick Up Service';
      items.push({
        name,
        qty: 1,
        discount: 0,
        amount: transaction?.order?.order_pick_up_service?.total_amount,
        currency: transaction?.currency,
        currency_sign: transaction?.booking?.currency_sign,
      });
    }

    if (renewal?.insurance_id) {
      const name = `${getTranslatedName(
        renewal?.insurance?.toJSON(),
        'name',
        language,
      )} - ${renewal?.insurance?.covered_amount}${transaction?.currency}`;
      items.push({
        name,
        qty: 1,
        discount: 0,
        amount: renewal?.insurance_amount,
        currency: transaction?.currency,
        currency_sign: transaction?.booking?.currency_sign,
      });
    }

    return items;
  }

  private async getCustomerInvoicePayload(
    transaction: TransactionModel,
    language?: string,
  ): Promise<CustomerInvoice> {
    const customerInvoice = new CustomerInvoice();
    const customerDetails = new CustomerDetails();
    const renewal = transaction?.booking?.renewals?.[0] || null;
    customerInvoice.currency_sign = transaction?.booking?.currency_sign || '';
    customerInvoice.deposit_amount = renewal?.deposit_amount || 0;
    customerInvoice.sub_total_amount = renewal?.sub_total_amount || 0;
    customerInvoice.invoice_id = transaction?.invoice_id;
    customerInvoice.discount_amount = renewal?.discount_amount || 0;
    const renewalTotalAmount = renewal?.total_amount || 0;
    const orderTotalAmount = transaction?.order?.total_amount || 0;

    customerInvoice.total_amount = orderTotalAmount + renewalTotalAmount;
    customerInvoice.paid_amount = transaction?.amount || 0;
    customerInvoice.issue_date = new Date(
      transaction?.booking?.renewals?.[0]?.renewal_paid_date,
    );
    customerInvoice.start_date = new Date(
      transaction?.booking?.renewals?.[0]?.renewal_start_date,
    );
    customerInvoice.end_date = new Date(
      transaction?.booking?.renewals?.[0]?.renewal_end_date,
    );
    customerInvoice.tax_amount = transaction?.booking?.total_tax_amount || 0;
    customerDetails.card_brand_name = transaction?.card_brand_name;
    customerDetails.card_last_digits = transaction?.card_last_digits;
    customerDetails.name = transaction?.booking?.customer_name;
    customerDetails.email = transaction?.booking?.customer_email;
    customerDetails.phone_number = transaction?.booking?.customer_phone_number;
    customerInvoice.transaction_short_id = transaction?.short_id;
    customerInvoice.customer = customerDetails;
    customerInvoice.items = this.getInvoiceItems(transaction, language);
    customerInvoice.payment_schedule = await this.renewalService.paymentSchedule(
      transaction.booking_id,
    );
    customerInvoice.applied_taxes = transaction?.booking?.applied_taxes;

    return customerInvoice;
  }

  public async getCustomerInvoice(
    where: CustomerInvoiceFilter,
    userId: number,
    language?: string,
  ): Promise<CustomerInvoice> {
    const transaction = await this.transactionEntity.findOne({
      where: { id: where?.transaction_id?._eq },
      include: [
        {
          model: BookingModel,
          where: { customer_id: userId },
          include: [
            {
              model: RenewalModel,
              where: { transaction_id: where?.transaction_id?._eq },
              include: [{ model: PlatformInsuranceModel }],
            },
            {
              model: AppliedTaxModel,
              include: [{ model: PlatformTaxModel }],
            },
          ],
        },
        { model: OrderModel, include: [{ model: OrderPickUpServiceModel }] },
      ],
    });

    if (!transaction) {
      throw NotFoundError('Transaction not found');
    }

    return await this.getCustomerInvoicePayload(transaction, language);
  }
}
