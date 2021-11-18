import { Logger } from '@nestjs/common';
import { Args, Context, Query, Resolver } from '@nestjs/graphql';

import { Auth, AuthUser, IAuthUser } from '../auth/auth.decorators';
import { UserRoles } from '../auth/users/interfaces/user.interface';
import { CustomerInvoice, CustomerInvoiceFilter } from '../graphql.schema';
import { BadRequestError } from '../shared/errors.messages';
import { InvoiceService } from './invoice.service';

@Resolver('Invoice')
export class InvoiceResolver {
  constructor(
    private readonly logger: Logger,
    private readonly invoiceService: InvoiceService,
  ) {
    this.logger.setContext(InvoiceResolver.name);
  }

  @Auth(UserRoles.CUSTOMER)
  @Query('customer_invoice')
  async customerInvoice(
    @Args('where') where: CustomerInvoiceFilter,
    @AuthUser() user: IAuthUser,
    @Context() context,
  ): Promise<CustomerInvoice> {
    if (!where?.transaction_id?._eq) {
      throw BadRequestError('Transaction id is required!');
    }

    const language = context?.req?.headers?.language;
    return this.invoiceService.getCustomerInvoice(
      where,
      user?.user_id,
      language,
    );
  }
}
