import { StatusCodes } from 'http-status-codes';
import { NonRetriableError } from './non-retriable-error';
import { ExtendedErrorProps } from './extended-error';

export class RetryError extends NonRetriableError {
  constructor(message: string, props?: ExtendedErrorProps) {
    super(message, { statusCode: StatusCodes.INTERNAL_SERVER_ERROR, ...props });

    // This is a limitation of typescript and jest
    // https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, RetryError.prototype);
  }
}
