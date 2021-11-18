import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { RabbitMQService } from './rabbitmq.service';

@Module({
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useFactory: async (configService: ConfigService) => ({
        uri: [configService.get<string>('app.rabbitmq.url')],
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [RabbitMQService, Logger],
  exports: [RabbitMQService],
})
export class RabbitMQAppModule {}
