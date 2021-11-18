import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { RabbitMQAppModule } from '../rabbitmq/rabbitmq.module';
import { databaseProviders } from './db.providers';

@Module({
  imports: [ConfigModule, RabbitMQAppModule],
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DbModule {}
