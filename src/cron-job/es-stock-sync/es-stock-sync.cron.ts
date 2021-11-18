import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import to from 'await-to-js';

import { AppModule } from '../../app.module';
import appConfig from '../../config/app.config';
import { RabbitMQAppModule } from '../../rabbitmq/rabbitmq.module';
import { RabbitMQService } from '../../rabbitmq/rabbitmq.service';
import { SiteModule } from '../../sites/sites/site.module';
import { SiteService } from '../../sites/sites/site.service';

const refundBookingCron = async () => {
  const app = await NestFactory.createApplicationContext(AppModule);
  const configService = new ConfigService({ app: appConfig() });
  const siteService = app.select(SiteModule).get(SiteService, { strict: true });
  const rabbitService = app
    .select(RabbitMQAppModule)
    .get(RabbitMQService, { strict: true });

  const logger = new Logger();
  //
  const [error, sites] = await to(siteService.findAllActiveSites());

  if (error) {
    logger.error('There is an error while fetching all active sites');
  }

  if (!sites) {
    logger.error('There is no active sites');
    await app.close();
  }
  const siteIds = sites.map((site) => site.id);
  logger.log(`Start adding ${siteIds.length} sites to rabbitQueue`);
  if (siteIds.length < 1) {
    logger.error('There is no active sites');
    await app.close();
  }
  const key = configService.get('app.rabbitmq.update_stock_key');
  try {
    await rabbitService.pushToQueue(key, { site_ids: siteIds });
    logger.log(`Synced ${siteIds.length} sites succesfully`);
  } catch (err) {
    logger.error('There is a problem while adding sites to queue');
    logger.error(err?.stack);
  }

  await app.close();
};

void refundBookingCron();
