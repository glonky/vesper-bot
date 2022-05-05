import { ExtendedError, ExtendedErrorProps } from './extended-error';

export class RetriableError<E extends Error = Error> extends ExtendedError<E> {
  public retryAttempts?: number;

  constructor(message: string, props?: ExtendedErrorProps<E>) {
    super(message, props);

    // This is a limitation of typescript and jest
    // https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, RetriableError.prototype);
    this.name = this.constructor.name;
  }
}
