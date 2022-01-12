import { inspect } from 'util';
import { StatusCodes } from 'http-status-codes';

export interface ExtendedErrorProps<E extends Error = Error> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [otherProps: string]: any;
  tenantId?: string;
  statusCode?: StatusCodes;
  userId?: string;
  error?: E;
}

export type RethrownExtendedErrorProps<E extends Error = Error> = ExtendedErrorProps<E> &
  Required<Pick<ExtendedErrorProps<E>, 'error'>>;

// https://gist.github.com/justmoon/15511f92e5216fa2624b
// https://www.bennadel.com/blog/2828-creating-custom-error-objects-in-node-js-with-error-capturestacktrace.htm
// https://docs.google.com/document/d/13Sy_kBIJGP0XT34V1CV3nkWya4TwYx9L3Yv45LdGB6Q/edit
// https://javascript.info/custom-errors
// https://stackoverflow.com/questions/42754270/re-throwing-exception-in-nodejs-and-not-losing-stack-trace
// https://rclayton.silvrback.com/custom-errors-in-node-js
// This is a limitation of typescript and jest
// https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
export class ExtendedError<E extends Error = Error> extends Error {
  public originalError?: E;

  public statusCode?: StatusCodes;

  constructor(message?: string, props?: ExtendedErrorProps<E> | RethrownExtendedErrorProps<E>) {
    super(message);

    this.statusCode = props?.statusCode;
    definePropertiesOnThis(this, props);

    // This solves an issue where util.inspect will print out the stack trace
    // of the originalError twice
    Object.defineProperty(this, 'originalError', {
      configurable: false,
      enumerable: true,
      value: props?.error,
      writable: false,
    });

    Object.setPrototypeOf(this, ExtendedError.prototype);

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
      if (this.originalError) {
        if (typeof this.createStackFromCause === 'function') {
          this.stack = this.createStackFromCause(this.originalError);
        } else {
          console.warn('this.createStackFromCause is not a function', this);
        }
      }
    } else {
      // NOTE: I think this is the best way to get the stack. Not sure though
      this.stack = this.createStackFromCause(this.originalError ?? new Error(this.message));
    }
  }

  /**
   * This is a hack so that if we want to inharet from RethrownError we also need to call
   * Error.captureStackTrace(this, this.constructor); but if we do that in the new Custom Error class
   * Then it will override this stack if we try to add it in this constructor
   * @param cause the error that is getting passed in. We could get this if it's non enumerable and set in the constructor
   */
  protected createStackFromCause(cause: Error) {
    // TODO: Maybe put this back in, not sure yet
    // const messageLines = (this.message.match(/\n/g) || []).length + 1;

    if (this.stack) {
      return `${this.stack
        .split('\n')
        // .slice(0, messageLines + 1)
        .join('\n')}\n${inspect(cause)}`;
    }

    return this.stack;
  }

  private setStack(stack?: string) {
    Object.defineProperty(this, 'stack', {
      configurable: false,
      enumerable: true,
      value: stack,
      writable: false,
    });
  }
}

function definePropertiesOnThis(errorToAddPropsTo: Error, props?: ExtendedErrorProps) {
  if (props) {
    const { error, code, ...rest } = props;
    Object.entries(rest).forEach(([key, value]) => {
      let inspectedValue = value?.toString();

      if (inspectedValue === '[object Object]') {
        inspectedValue = inspect(value, { depth: null, showHidden: true });
      }

      Object.defineProperty(errorToAddPropsTo, key, {
        configurable: false,
        enumerable: true,
        value,
        writable: false,
      });
    });
  }
}
