import { StatusCodes } from 'http-status-codes';
import { NonRetriableError } from './non-retriable-error';
import { ExtendedErrorProps } from './extended-error';

export class NotFoundError extends NonRetriableError {
  constructor(message: string, props?: ExtendedErrorProps) {
    super(message, { statusCode: StatusCodes.NOT_FOUND, ...props });

    // This is a limitation of typescript and jest
    // https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
