import { Logger, Module } from '@nestjs/common';

import { countryProvider } from '../../countries/country.provider';
import { DbModule } from '../../db/db.module';
import { SpaceModule } from '../../spaces/spaces/space.module';
import { platformSpaceTypeProvider } from './space-type.provider';
import { PlatformSpaceTypeResolver } from './space-type.resolver';
import { PlatformSpaceTypeService } from './space-type.service';

@Module({
  imports: [DbModule, SpaceModule],
  providers: [
    ...platformSpaceTypeProvider,
    ...countryProvider,
    PlatformSpaceTypeService,
    PlatformSpaceTypeResolver,
    Logger,
  ],
  exports: [PlatformSpaceTypeService, ...platformSpaceTypeProvider],
})
export class PlatformSpaceTypeModule {}
