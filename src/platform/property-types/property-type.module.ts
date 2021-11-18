import { Logger, Module } from '@nestjs/common';

import { DbModule } from '../../db/db.module';
import { propertyTypeProvider } from './property-type.provider';
import { PropertyTypeResolver } from './property-type.resolver';
import { PropertyTypeService } from './property-type.service';

@Module({
  imports: [DbModule],
  providers: [
    ...propertyTypeProvider,
    PropertyTypeResolver,
    PropertyTypeService,
    Logger,
  ],
  exports: [PropertyTypeService],
})
export class PropertyTypeModule {}
