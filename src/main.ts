import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import appConfig from 'config/app.config';
import * as dotenv from 'dotenv';

import { AppModule } from './app.module';
dotenv.config();

const logger = new Logger('MainApp', true);

async function bootstrap(): Promise<void> {
  const configService = new ConfigService({ app: appConfig() });
  const port = configService.get<number>('app.port');
  const host = configService.get<string>('app.host');
  const apiVersion = configService.get<string>('app.apiVersion');

  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
  );

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix(apiVersion);
  app.useLogger(logger);
  await app.listen(port, host);
}
/* eslint-disable @typescript-eslint/no-floating-promises */
bootstrap();
