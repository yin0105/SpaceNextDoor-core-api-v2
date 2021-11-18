import {
  isNumberString,
  length,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

// eslint-disable-next-line @typescript-eslint/tslint/config
export function ValidateOTP(validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (obj: object, propertyName: string): void => {
    registerDecorator({
      name: 'OTPValidator',
      target: obj.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(otp: string) {
          return isNumberString(otp) && length(otp, 6, 6);
        },
      },
    });
  };
}
