import { inspect } from 'util';
import { StatusCodes } from 'http-status-codes';
import _ from 'lodash';

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

    definePropertiesOnThis(this, props);

    // This solves an issue where util.inspect will print out the stack trace
    // of the originalError twice
    if (props?.error) {
      Object.defineProperty(this, 'originalError', {
        configurable: false,
        enumerable: true,
        value: props?.error,
        writable: false,
      });
    }

    Object.setPrototypeOf(this, ExtendedError.prototype);
    this.name = this.constructor.name;
  }
}

function definePropertiesOnThis(errorToAddPropsTo: Error, props?: ExtendedErrorProps) {
  if (props) {
    const { error, code, ...rest } = props;
    Object.entries(_.omitBy(rest, _.isNil)).forEach(([key, value]) => {
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
