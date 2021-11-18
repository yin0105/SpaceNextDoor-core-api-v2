import { ConfigService } from '@nestjs/config';

import appConfig from '../../config/app.config';

export function validateLanguageSync(language: string): boolean {
  // if there is no provided language, make an early return and skip validation
  if (!language) {
    return true;
  }
  const configService = new ConfigService({ app: appConfig() });
  const supportedLanguages = configService.get<string[]>(
    'app.supportedLanguages',
  );
  return supportedLanguages.includes(language);
}
