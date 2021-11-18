import { Logger, Module } from '@nestjs/common';

import { DbModule } from '../../db/db.module';
import { landmarkProvider } from './landmark.provider';

@Module({
  imports: [DbModule],
  providers: [...landmarkProvider, Logger],
  exports: [],
})
export class LandmarkModule {}
