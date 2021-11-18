import { BadRequestException } from '@nestjs/common';

import { ValidateUsername } from '../../shared/validators/username.validator';

export class SendOTPPayloadDTO {
  @ValidateUsername({
    message: () => {
      throw new BadRequestException(
        'Username can either be phone number or email!',
      );
    },
  })
  username: string;
}
