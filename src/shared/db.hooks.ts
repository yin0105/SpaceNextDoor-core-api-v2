import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

import appConfig from '../config/app.config';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

dotenv.config();

interface IQueuePayload {
  space_id?: number;
  site_id?: number;
  site_ids?: number[];
  is_created?: boolean;
  is_deleted?: boolean;
}

interface IQueueData {
  key: string;
  data: IQueuePayload;
}

export class DBHooksUtil {
  private readonly configService: ConfigService;
  private readonly logger: Logger;

  constructor() {
    this.configService = new ConfigService({ app: appConfig() });
    this.logger = new Logger('DBHooksUtil', true);
  }

  async afterCreate(record: any, service: RabbitMQService): Promise<void> {
    this.logger.log(`After Create hook ${record?.id}`);
    let payload = {};

    // make sure its SITE which is being create and create in ES
    if (
      !!record?.stock_management_type &&
      !!record?.property_type_id &&
      !record?.site_id
    ) {
      payload = { is_created: true };
    }
    const data = this.getInfoBasedOnInstance(record, payload);
    if (!data.length) {
      return;
    }
    await Promise.all(data.map((d) => service.pushToQueue(d.key, d.data)));
  }

  async afterUpdate(record: any, service: RabbitMQService): Promise<void> {
    this.logger.log(`After Update hook ${record?.id}`);
    const data = this.getInfoBasedOnInstance(record);
    if (!data.length) {
      return;
    }
    await Promise.all(data.map((d) => service.pushToQueue(d.key, d.data)));
  }

  async afterDelete(record: any, service: RabbitMQService): Promise<void> {
    this.logger.log(`After Delete hook ${record?.id}`);
    const data = this.getInfoBasedOnInstance(record, {
      is_deleted: true,
    });
    if (!data.length) {
      return;
    }
    await Promise.all(data.map((d) => service.pushToQueue(d.key, d.data)));
  }

  /**
   * IMPORTANT: Its a hack to identify the table of the record, as wasn't able to find
   * From the hook instance, as soon as we find that, we'll remove this and get table name directly from hook
   *
   * @param record db table record
   */
  private getInfoBasedOnInstance(record: any, preData: any = {}): IQueueData[] {
    if (
      record?.short_id &&
      record?.move_in_date &&
      record?.site_id &&
      record?.space_id
    ) {
      // means something created/updated/deleted in bookings table
      //
      const siteId = record?.site_id;
      return [
        {
          key: this.configService.get('app.rabbitmq.update_stock_key'),
          data: {
            site_id: siteId,
            site_ids: [siteId],
            ...preData,
          },
        },
      ];
    }

    if (record?.site_id || record?.stock_management_type) {
      const respData: IQueueData[] = [];
      // means something updated/created/deleted in sites related records
      //
      const siteId = record?.site_id || record?.id;
      respData.push({
        key: this.configService.get('app.rabbitmq.update_es_key'),
        data: {
          site_id: siteId,
          site_ids: [siteId],
          ...preData,
        },
      });

      if (record?.stock_management_type) {
        // means something updated/created/deleted in sites or spaces
        // so we update stock as well
        respData.push({
          key: this.configService.get('app.rabbitmq.update_stock_key'),
          data: {
            site_id: siteId,
            site_ids: [siteId],
            ...preData,
          },
        });
      }

      return respData;
    }

    return [];
  }
}
