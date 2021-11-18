import { CustomScalar, Scalar } from '@nestjs/graphql';
import { Validator } from 'class-validator';
import { GraphQLError, ValueNode } from 'graphql';

@Scalar('Date', (_type) => Date)
export class DateScalar implements CustomScalar<string | Date, Date> {
  description = 'Date custom scalar type';

  private validator: Validator;

  constructor() {
    this.validator = new Validator();
  }

  parseValue(value: string): Date {
    if (value) {
      return new Date(value);
    }

    return null;
  }

  serialize(value: Date): Date {
    return value;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  parseLiteral(ast: ValueNode): Date {
    // if (
    //   (ast.kind === Kind.INT || ast.kind === Kind.STRING) &&
    //   this.validator.validate(ast.value)
    // ) {
    //   return new Date(ast.value);
    // }
    throw new GraphQLError(
      'Date cannot represent an invalid ISO-8601 Date string',
    );
  }
}
