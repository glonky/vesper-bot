import { NonRetriableError } from './non-retriable-error';
import { ExtendedErrorProps } from './extended-error';

export function assertion(message: string, thingToAssert: any, props?: ExtendedErrorProps): asserts thingToAssert;
export function assertion(
  message: string,
  thingToAssert: any,
  props?: { new (...args: any[]): NonRetriableError },
): asserts thingToAssert;
export function assertion(
  message: string,
  thingToAssert: any,
  ErrorToThrowOrProps?: { new (...args: any[]): NonRetriableError } | ExtendedErrorProps,
  props?: ExtendedErrorProps,
): asserts thingToAssert;

export function assertion(
  message: string,
  thingToAssert: any,
  ErrorToThrowOrProps?: { new (...args: any[]): NonRetriableError } | ExtendedErrorProps,
  props?: ExtendedErrorProps,
): asserts thingToAssert {
  if (!thingToAssert) {
    if (isErrorToThrowOrPropsError(ErrorToThrowOrProps)) {
      if (ErrorToThrowOrProps) {
        throw new ErrorToThrowOrProps(message, props);
      }
    }

    throw new AssertionError(message, ErrorToThrowOrProps ?? props);
  }
}

function isErrorToThrowOrPropsError(
  ErrorToThrowOrProps?: { new (...args: any[]): NonRetriableError } | ExtendedErrorProps,
): ErrorToThrowOrProps is { new (...args: any[]): NonRetriableError } {
  if (typeof ErrorToThrowOrProps === 'object') {
    return false;
  }

  return true;
}

export class AssertionError extends NonRetriableError {
  constructor(message: string, props?: ExtendedErrorProps) {
    super(message, props);

    // This is a limitation of typescript and jest
    // https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, AssertionError.prototype);
    this.name = this.constructor.name;
  }
}
