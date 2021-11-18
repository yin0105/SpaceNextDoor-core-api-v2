import { BadRequestException } from '@nestjs/common';
import { IsOptional } from 'class-validator';

import { ValidateOTP } from '../../shared/validators/otp.validator';
import { ValidateUsername } from '../../shared/validators/username.validator';
export class LoginPayloadDTO {
  @ValidateUsername({
    message: () => {
      throw new BadRequestException(
        'Username can either be phone number or email!',
      );
    },
  })
  username: string;

  @IsOptional()
  preferred_language?: string;

  @ValidateOTP({
    message: () => {
      throw new BadRequestException('OTP needs to be 6 digits');
    },
  })
  otp: string;
}
