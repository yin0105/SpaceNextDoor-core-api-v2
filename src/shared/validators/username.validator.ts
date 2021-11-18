import {
  isEmail,
  isPhoneNumber,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

// eslint-disable-next-line @typescript-eslint/tslint/config
export function ValidateUsername(validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (obj: object, propertyName: string): void => {
    registerDecorator({
      name: 'UsernameValidator',
      target: obj.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(username: string) {
          const hasEmail = username.indexOf('@') > 0;

          if (hasEmail) {
            return isEmail(username);
          }

          return isPhoneNumber(username, null);
        },
      },
    });
  };
}
