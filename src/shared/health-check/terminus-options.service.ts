import { HealthCheckError } from '@godaddy/terminus';
import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  HealthIndicatorResult,
  TerminusEndpoint,
  TerminusModuleOptions,
  TerminusOptionsFactory,
} from '@nestjs/terminus';
import { Sequelize } from 'sequelize-typescript';

import { RabbitMQService } from '../../rabbitmq/rabbitmq.service';
import { SEQUELIZE_PROVIDER } from '../constant/app.constant';

@Injectable()
export class TerminusOptionsService implements TerminusOptionsFactory {
  constructor(
    @Inject(SEQUELIZE_PROVIDER) private readonly sequelize: Sequelize,
    private readonly rabbitMqService: RabbitMQService,
  ) {}

  createTerminusOptions(): TerminusModuleOptions {
    const healthEndpoint: TerminusEndpoint = {
      url: '/health',
      healthIndicators: [
        async () => {
          const result: HealthIndicatorResult = {
            'Database service': {
              status: 'up',
            },
          };
          try {
            await this.sequelize.authenticate();
            Logger.log('Database is up');
            return result;
          } catch (err) {
            throw new HealthCheckError('Database is down', err);
          }
        },
        async () => {
          const result: HealthIndicatorResult = {
            'RabbitMQ service': {
              status: 'up',
            },
          };
          try {
            await this.rabbitMqService.rabbitMQConnected();
            Logger.log('Rabbit MQ Service is up');
            return result;
          } catch (e) {
            Logger.error('Rabbit MQ Service is down');
            throw new HealthCheckError(
              'Notifications service Rabbit MQ is down',
              e,
            );
          }
        },
      ],
    };
    return {
      endpoints: [healthEndpoint],
    };
  }
}
