import { Logger, Module } from '@nestjs/common';

import { platformBankProvider } from './bank.provider';
import { BankResolver } from './bank.resolver';
import { BankService } from './bank.service';

@Module({
  imports: [],
  providers: [...platformBankProvider, BankService, BankResolver, Logger],
  exports: [BankService, ...platformBankProvider],
})
export class PlatformBankModule {}
