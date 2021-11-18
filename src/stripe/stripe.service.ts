import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectStripe } from 'nestjs-stripe';
import Stripe from 'stripe';

import { UserModel } from '../auth/users/user.model';
import { USER_REPOSITORY } from '../shared/constant/app.constant';
import { BadRequestError } from '../shared/errors.messages';

@Injectable()
export class StripeService {
  constructor(
    @InjectStripe() private readonly stripeClient: Stripe,
    @Inject(USER_REPOSITORY)
    private readonly userEntity: typeof UserModel,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(StripeService.name);
  }

  public async charge(
    amount: number,
    currency: string,
    customerId: string,
    description: string,
  ): Promise<Stripe.Charge> {
    return await this.stripeClient.charges.create({
      amount,
      currency,
      customer: customerId,
      description,
    });
  }

  public async refund(charge: string): Promise<Stripe.Refund> {
    return await this.stripeClient.refunds.create({ charge });
  }

  public async refundWithAmount(
    charge: string,
    amount: number,
  ): Promise<Stripe.Refund> {
    return this.stripeClient.refunds.create({ charge, amount });
  }

  public async retrieveCard(customerId: string): Promise<Stripe.Card> {
    const customer = (await this.stripeClient.customers.retrieve(
      customerId,
    )) as Stripe.Customer;

    return (this.stripeClient.customers.retrieveSource(
      customerId,
      customer?.default_source as string,
    ) as undefined) as Stripe.Card;
  }

  public calculateAmountInCurrency(amount: number, currency: string): number {
    // eslint-disable-next-line no-restricted-syntax
    console.log('TEST_CHECKOUT_ISSUE: currency: ', amount, currency);
    if (currency.toLowerCase() === 'jpy' || currency.toLowerCase() === 'krw') {
      // For zero-decimal currencies, provide amount as an integer but without multiplying by 100.
      // For example, to charge ¥500, provide an amount value of 500
      // TODO: we need to make sure amount is integer, not parse like this
      return parseInt(amount.toFixed(2), 10);
    }

    if (currency.toLowerCase() === 'thb' || currency.toLowerCase() === 'sgd') {
      // eslint-disable-next-line no-restricted-syntax
      console.log('TEST_CHECKOUT_ISSUE: in sgd');
      // For non zero-decimal currencies, provide amount as an integer but with multiplying by 100.
      // For example, to charge 10 USD, provide an amount value of 1000 (i.e., 1000 cents).
      const chargeAmount = amount * 100;
      return parseInt(chargeAmount.toFixed(2), 10);
    }

    throw BadRequestError('Currency not supported.');
  }

  async upsertStripeCustomerSource(
    token: string,
    stripeCustomerId?: string,
    email?: string,
    phone?: string,
  ): Promise<Stripe.Customer> {
    if (!stripeCustomerId && !token) {
      throw BadRequestError('Card Token is required!');
    }

    if (stripeCustomerId && token) {
      return await this.stripeClient.customers.update(stripeCustomerId, {
        source: token,
        email,
        phone,
      });
    }

    if (!stripeCustomerId && token) {
      return await this.stripeClient.customers.create({
        source: token,
        email,
        phone,
      });
    }
  }

  async getStripeCustomerId(
    customerId: number,
    token?: string,
    customerEmail?: string,
    customerPhone?: string,
  ): Promise<{ id: string; isUpdated: boolean }> {
    const customer = await this.userEntity.findByPk(customerId);

    if (!customer?.stripe_customer_id && !token) {
      throw BadRequestError('Card Token is required!');
    }

    if (customer?.stripe_customer_id && !token) {
      return {
        id: customer?.stripe_customer_id,
        isUpdated: false,
      };
    }

    const stripeCustomer = await this.upsertStripeCustomerSource(
      token,
      customer?.stripe_customer_id,
      customerEmail,
      customerPhone,
    );

    return {
      id: stripeCustomer.id,
      isUpdated: true,
    };
  }
}
