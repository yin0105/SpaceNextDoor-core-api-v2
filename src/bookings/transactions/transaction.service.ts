import { Inject, Injectable, Logger } from '@nestjs/common';
import { Op, Transaction as T, WhereOptions } from 'sequelize';

import { BookingModel } from '../../bookings/booking.model';
import { RenewalModel } from '../../bookings/renewals/renewal.model';
import {
  Pagination,
  Transaction,
  TransactionInsurance,
  TransactionsFilter,
  TransactionsResp,
} from '../../graphql.schema';
import { OrderModel } from '../../orders/order.model';
import { OrderPickUpServiceModel } from '../../orders/pick_up_service/order-pick-up-service.model';
import { PlatformInsuranceModel } from '../../platform/insurances/insurance.model';
import { TRANSACTION_REPOSITORY } from '../../shared/constant/app.constant';
import { hasMoreRec, initPagination } from '../../shared/utils';
import { toSequelizeComparator } from '../../shared/utils/graphql-to-sequelize-comparator';
import { getPlainObject } from '../../utils';
import { ITransactionEntity } from './interfaces/transaction.interface';
import { TransactionModel } from './transaction.model';

@Injectable()
export class TransactionService {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionEntity: typeof TransactionModel,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(TransactionService.name);
  }

  public async getByBookingId(bookingId: number): Promise<Transaction[]> {
    const result = await this.transactionEntity.findAll({
      where: { booking_id: bookingId },
      include: [
        { model: BookingModel, include: [{ model: PlatformInsuranceModel }] },
        { model: OrderModel, include: [{ model: OrderPickUpServiceModel }] },
        { model: RenewalModel },
      ],
      order: [['id', 'ASC']],
    });

    return this.formatTransactions(result);
  }

  public async create(
    payload: Partial<ITransactionEntity>,
    args: { t: T },
  ): Promise<ITransactionEntity> {
    return await this.transactionEntity.create(payload, {
      transaction: args?.t,
    });
  }

  public async update(
    payload: Partial<ITransactionEntity>,
    args: { id: number; t: T },
  ): Promise<any> {
    return await this.transactionEntity.update(payload, {
      where: { id: { [Op.eq]: args?.id } },
      transaction: args?.t,
    });
  }

  public async getAll(
    pagination: Pagination,
    where: TransactionsFilter = {},
    args: { user_id: number },
  ): Promise<TransactionsResp> {
    this.logger.log(`findAll with payload where: ${JSON.stringify(where)}`);
    pagination = initPagination(pagination);

    const whereFilter: WhereOptions = toSequelizeComparator({
      user_id: {
        _eq: args.user_id,
      },
      id: where?.id,
      type: where?.type,
      booking_id: where?.booking_id,
      created_at:
        where?.from_date && where?.to_date
          ? {
              _gte: where?.from_date?._gt,
              _lte: where?.to_date?._lt,
            }
          : undefined,
    });

    const { count, rows } = await this.transactionEntity.findAndCountAll({
      where: whereFilter,
      limit: pagination.limit,
      offset: pagination.skip,
      include: [
        { model: BookingModel, include: [{ model: PlatformInsuranceModel }] },
        { model: OrderModel, include: [{ model: OrderPickUpServiceModel }] },
        { model: RenewalModel },
      ],
      order: [['created_at', 'DESC']],
    });

    const data = this.formatTransactions(rows);

    const result = new TransactionsResp();
    result.edges = data;
    result.page_info = {
      ...pagination,
      total: count,
      has_more: hasMoreRec(count, pagination),
    };

    return result;
  }

  formatTransactions(rows: TransactionModel[]): Transaction[] {
    const recs: TransactionModel[] = getPlainObject(rows);
    return recs.map((row) => {
      let insurance: TransactionInsurance;
      if (row?.booking?.insurance) {
        insurance = {
          ...row.booking.insurance,
          total_amount: row.renewal?.insurance_amount || 0,
        };
      }

      const transaction = {
        ...row,
        insurance,
        order_pick_up_service: row.order?.order_pick_up_service,
      };
      return (transaction as undefined) as Transaction;
    });
  }

  public async getByOrderId(orderId: number): Promise<Transaction> {
    const result = await this.transactionEntity.findAll({
      where: { order_id: orderId },
    });
    return this.formatTransactions(result)?.[0] || null;
  }
}
