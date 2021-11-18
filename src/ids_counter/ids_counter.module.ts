import { HttpModule, Logger, Module } from '@nestjs/common';

import { DbModule } from '../db/db.module';
import { idCounterProvider } from './ids_counter.provider';
import { IDCounterService } from './ids_counter.service';

@Module({
  imports: [DbModule, HttpModule],
  providers: [IDCounterService, Logger, ...idCounterProvider],
  exports: [IDCounterService],
})
export class IDCounterModule {}
