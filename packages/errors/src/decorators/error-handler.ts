/* eslint-disable @typescript-eslint/no-throw-literal */
/* eslint-disable @typescript-eslint/ban-types */
import { isPromise } from '@vesper-discord/utils';
import { ErrorConverter } from '../error-converter';
import { ExtendedError } from '../extended-error';

export type ExtraPropsType<E extends Error = Error, P = any> = P | ((props: { error: E; scope: any }) => P);

export interface ErrorHandlerProps<E extends Error = Error, P = any> {
  converter?: { new (...args: any[]): ErrorConverter<E> };
  ignoreErrors?: { new (...args: any[]): Error }[];
  message?: string;
  extraProps?: ExtraPropsType<E, P>;
}

export const ErrorHandler =
  <E extends Error = Error, P = any>(props?: ErrorHandlerProps<E, P>) =>
  (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
    const isMethod = descriptor.value instanceof Function;
    if (!isMethod) throw new Error('Convert error decorator must be used on a function');

    const originalMethod = descriptor.value as Function;

    return {
      ...descriptor,
      value: function ErrorHandlerDecorator(...functionArgs: any[]) {
        try {
          const result = originalMethod.apply(this, functionArgs);

          if (isPromise(result)) {
            return result.catch((err: E) => {
              const extraProps =
                props?.extraProps instanceof Function
                  ? props.extraProps({ error: err, scope: this })
                  : props?.extraProps;
              const convertedError = convertError(err, extraProps);

              if (shouldIgnoreError(err, convertedError)) {
                return;
              }

              throw convertedError;
            });
          }

          return result;
        } catch (err) {
          if (err instanceof Error) {
            const extraProps =
              props?.extraProps instanceof Function
                ? props.extraProps({ error: err as E, scope: this })
                : props?.extraProps;
            const convertedError = convertError(err as E, extraProps);

            if (shouldIgnoreError(err, convertedError)) {
              return;
            }

            throw convertedError;
          }

          throw err;
        }

        function shouldIgnoreError(err: Error, convertedError: Error) {
          if (
            props?.ignoreErrors?.find(
              (ignoreError) => err instanceof ignoreError || convertedError instanceof ignoreError,
            )
          ) {
            return true;
          }

          return false;
        }

        function convertError(err: E, extraProps?: P) {
          let errorToThrow = err;

          // TODO: Maybe we don't need to have this. We might want to be able to handle errors that we have thrown
          if (props?.converter && !(err instanceof ExtendedError)) {
            const converterInstance = new props.converter();
            const fullyQualifiedName = `${target.constructor.name}.${propertyKey}`;

            const message = props.message ?? `Error calling ${fullyQualifiedName}`;
            errorToThrow = converterInstance.convertError({ error: err, extraProps }) as E;

            Object.defineProperty(errorToThrow, 'errorHandlerMessage', {
              configurable: false,
              enumerable: true,
              value: message,
              writable: false,
            });
          }

          return errorToThrow;
        }
      },
    };
  };
