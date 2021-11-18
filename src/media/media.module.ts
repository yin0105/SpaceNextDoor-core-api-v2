import { Logger, Module } from '@nestjs/common';

import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { S3Service } from './s3.service';

@Module({
  imports: [],
  providers: [MediaService, S3Service, Logger],
  controllers: [MediaController],
  exports: [],
})
export class MediaModule {}
