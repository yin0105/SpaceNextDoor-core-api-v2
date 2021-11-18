import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transaction } from 'sequelize';

import { IDS_COUNTER_REPOSITORY } from '../shared/constant/app.constant';
import { IDCounterModel } from './ids_counter.model';
import { IDCounterEntity } from './interfaces/ids-counter.interface';

type CounterType = 'BOOKING' | 'ORDER' | 'TRANSACTION' | 'INVOICE';
@Injectable()
export class IDCounterService {
  private nodeEnv: string;
  constructor(
    @Inject(IDS_COUNTER_REPOSITORY)
    private readonly idCounterEntity: typeof IDCounterModel,
    private readonly logger: Logger,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(IDCounterService.name);
    this.nodeEnv = this.configService.get<string>('app.nodeEnv');
  }

  public async generateBookingId(args?: { t: Transaction }): Promise<string> {
    try {
      const counter = await this.createUpdateCounter('BOOKING', args?.t);
      return this.getLongId(counter?.last_id, 'BOOKING');
    } catch (error) {
      this.logger.error('There is an error with generateBookingId');
      throw error;
    }
  }

  public async generateOrderId(args?: { t: Transaction }): Promise<string> {
    try {
      const counter = await this.createUpdateCounter('ORDER', args?.t);

      return this.getLongId(counter?.last_id, 'ORDER');
    } catch (error) {
      this.logger.error('There is an error with generateOrderId');
      throw error;
    }
  }

  public async generateTransactionId(args?: {
    t: Transaction;
  }): Promise<string> {
    try {
      const counter = await this.createUpdateCounter('TRANSACTION', args?.t);
      return this.getLongId(counter?.last_id, 'TRANSACTION');
    } catch (error) {
      this.logger.error('There is an error with generateTransactionId');
      throw error;
    }
  }

  public async generateInvoiceId(args?: { t: Transaction }): Promise<string> {
    try {
      const counter = await this.createUpdateCounter('INVOICE', args?.t);
      return this.getLongId(counter?.last_id, 'INVOICE');
    } catch (error) {
      this.logger.error('There is an error with generateInvoiceId');
      throw error;
    }
  }

  private async createUpdateCounter(
    type: CounterType,
    t?: Transaction,
  ): Promise<IDCounterEntity> {
    const counter = await this.idCounterEntity.increment('last_id', {
      where: { type },
      transaction: t,
    });

    if (!counter[0][0][0]) {
      const doc = await this.idCounterEntity.create({
        last_id: 1,
        type,
      });

      return (doc.toJSON() as undefined) as IDCounterEntity;
    }

    return counter[0][0][0];
  }

  private getLongId(lastId: number, type: CounterType): string {
    let shortId: number;

    switch (this.nodeEnv) {
      case 'development':
        shortId = 700000 + lastId;
        break;
      case 'staging':
        shortId = 800000 + lastId;
        break;
      case 'production':
        shortId = 900000 + lastId;
    }

    switch (type) {
      case 'ORDER':
        return `OR_${shortId}`;
      case 'BOOKING':
        return shortId.toString();
      case 'TRANSACTION':
        return `TR_${shortId}`;
      case 'INVOICE':
        return `SND-${100000 + lastId}`;
    }
  }
}
