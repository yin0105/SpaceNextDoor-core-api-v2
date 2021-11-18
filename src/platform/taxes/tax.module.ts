import { Logger, Module } from '@nestjs/common';

@Module({
  imports: [],
  providers: [Logger],
  exports: [],
})
export class PlatformTaxModule {}
