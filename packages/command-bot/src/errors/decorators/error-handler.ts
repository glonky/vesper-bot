/* eslint-disable new-cap */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/ban-types */
import { isPromise } from '../../utils';
import { ErrorConverter } from '../error-converter';
import { ExtendedError } from '../extended-error';

export interface ErrorHandlerProps<E extends Error = Error> {
  converter?: { new (...args: any[]): ErrorConverter<E> };
  reportError?: boolean;
  ignoreErrors?: { new (...args: any[]): Error }[];
  message?: string;
}

export const ErrorHandler =
  <E extends Error = Error>(props?: ErrorHandlerProps<E>) =>
  (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
    const isMethod = descriptor.value instanceof Function;
    if (!isMethod) throw new Error('Convert error decorator must be used on a function');

    const originalMethod = descriptor.value as Function;

    descriptor.value = function ErrorHandlerDecorator(...functionArgs: any[]) {
      try {
        const result = originalMethod.apply(this, functionArgs);
        if (isPromise(result)) {
          return result.catch((err: any) => {
            if (props?.reportError) {
              // await reportError({
              //   error: err,
              // });
            }

            let errorToThrow = err;

            if (props?.converter && !(err instanceof ExtendedError)) {
              const converterInstance = new props.converter();
              const fullyQualifiedName = `${target.constructor.name}.${propertyKey}`;

              const message = props.message ? props.message : `Error calling ${fullyQualifiedName}`;
              errorToThrow = converterInstance.convertError({ error: err, message });
            }

            if (
              props?.ignoreErrors?.find(
                (ignoreError) => err instanceof ignoreError || errorToThrow instanceof ignoreError,
              )
            ) {
              return null;
            }

            throw errorToThrow;
          });
        }
        return result;
      } catch (err) {
        if (props?.reportError) {
          // await reportError({
          //   error: err,
          // });
        }

        let errorToThrow = err;

        if (props?.converter && !(err instanceof ExtendedError)) {
          const converterInstance = new props.converter();
          const fullyQualifiedName = `${target.constructor.name}.${propertyKey}`;

          const message = props.message ? props.message : `Error calling ${fullyQualifiedName}`;
          errorToThrow = converterInstance.convertError({ error: err as E, message });
        }

        if (
          props?.ignoreErrors?.find((ignoreError) => err instanceof ignoreError || errorToThrow instanceof ignoreError)
        ) {
          return null;
        }

        throw errorToThrow;
      }
    };

    return descriptor;
  };
