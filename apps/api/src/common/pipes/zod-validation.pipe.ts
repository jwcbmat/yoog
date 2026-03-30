import { PipeTransform, BadRequestException, Injectable } from '@nestjs/common';
import { ZodType } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      const formattedErrors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
        rule: issue.code,
      }));

      throw new BadRequestException({
        code: 'UNPROCESSABLE_ENTITY',
        message: 'Input data validation failed',
        errors: formattedErrors,
      });
    }

    return result.data;
  }
}
