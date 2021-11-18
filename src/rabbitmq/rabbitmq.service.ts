import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RabbitMQService {
  private exchange: string;
  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(RabbitMQService.name);
    this.exchange = this.configService.get('app.rabbitmq.exchange');
  }

  public async pushToQueue(key: string, data: any): Promise<void> {
    this.logger.log(
      `Pushing to QUEUE on ${this.exchange}: ${key} => ${JSON.stringify(data)}`,
    );
    await this.amqpConnection?.publish(this.exchange, key, data);
  }

  // for health check
  public async rabbitMQConnected(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.amqpConnection.managedConnection.isConnected()) {
        resolve(true);
      }
      reject();
    });
  }
}
