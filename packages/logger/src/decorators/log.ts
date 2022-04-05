/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-continue */
import { performance } from 'perf_hooks';
import { isPromise } from '@vesper-discord/utils';
import { NotFoundError } from '@vesper-discord/errors';
import Container from 'typedi';
import { asyncLocalStorage } from '@vesper-discord/container';
import { ulid } from 'ulid';
import { Logger } from '../logger';
import { Config } from '../config';

export type LogInputFn<This, T> = (props: { scope: This; input: T[] }) => any;
export type LogOutputFn<This, T> = (props: { scope: This; result: T; input: T[] }) => any;

export interface LogProps<This, Input, Result> {
  logLevel?: 'info' | 'debug' | 'trace' | false;
  logCache?:
    | {
        hit?: boolean;
        miss?: boolean;
        ttl?: boolean;
        key?: boolean;
      }
    | boolean;
  logRetry?:
    | {
        attempts?: boolean;
        error?: boolean;
      }
    | boolean;
  ignoreErrors?: { new (...args: any[]): Error }[];
  message?: string;
  category?: string;
  logInput?: Boolean | LogInputFn<This, Input>;
  logResult?: Boolean | LogOutputFn<This, Result>;
}

export const Log =
  (props?: LogProps<any, any, any>) => (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
    const { logLevel, logInput, logResult } = props ?? {};

    const isMethod = descriptor.value instanceof Function;
    if (!isMethod) throw new Error('Logger decorator must be used on a function');

    const originalMethod = descriptor.value as Function;

    return {
      ...descriptor,
      value: async function logDecorator(...functionArgs: any[]) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const boundThis = this;

        const store = new Map();
        store.set('id', ulid());

        return asyncLocalStorage.run(store, async () => {
          const logId = asyncLocalStorage.getStore()?.get('id');
          const fullyQualifiedName = `${target.constructor.name}.${propertyKey}`;

          const startTime = performance.now();

          const container = Container;
          const config = container.get(Config);
          const finalLogLevel = logLevel === false ? false : logLevel ?? config.logDecoratorLevel;
          const logger = (this as any).logger ?? container.get(Logger);
          let inputArgsToLog: any;

          if (finalLogLevel !== false) {
            if (typeof logInput === 'boolean' && logInput === true) {
              inputArgsToLog = functionArgs;
            } else if (typeof logInput === 'function') {
              inputArgsToLog = logInput({ input: functionArgs, scope: this });
            }

            logger[finalLogLevel](props?.message ? `Starting: ${props.message}` : 'Calling method', {
              category: props?.category,
              input: inputArgsToLog,
              logId,
              method: fullyQualifiedName,
            });
          }

          try {
            const result = originalMethod.apply(this, functionArgs);

            if (isPromise(result)) {
              return await result
                .then((promiseResult: any) => {
                  onSuccess(promiseResult);
                  return promiseResult;
                })
                .catch((err: Error) => {
                  onError(err);
                });
            }

            onSuccess(result);
            return result;
          } catch (err) {
            onError(err as Error);
          }

          function onError(err: Error) {
            if (finalLogLevel !== false) {
              const ignoreErrors = [...(props?.ignoreErrors ?? []), NotFoundError];

              if (ignoreErrors.find((ignoreError) => err instanceof ignoreError)) {
                throw err;
              }

              const elapsedTimeMs = performance.now() - startTime;

              const retryAttempts = asyncLocalStorage.getStore()?.get('retryAttempts');

              logger.error(props?.message ? `Error: ${props.message}` : 'Error calling method', {
                category: props?.category,
                elapsedTimeMs,
                error: err,
                logId,
                method: fullyQualifiedName,
                retryAttempts,
              });
            }

            throw err;
          }

          function onSuccess(result: any) {
            if (finalLogLevel !== false) {
              const elapsedTimeMs = performance.now() - startTime;
              let outputArgsToLog;

              if (typeof logResult === 'boolean' && logResult === true) {
                outputArgsToLog = result;
              } else if (typeof logResult === 'function') {
                outputArgsToLog = logResult({ input: functionArgs, result, scope: boundThis });
              }

              const retryAttempts = asyncLocalStorage.getStore()?.get('retryAttempts');
              const retryAttemptError = asyncLocalStorage.getStore()?.get('retryAttemptError');
              const cacheHit = asyncLocalStorage.getStore()?.get('cacheHit');
              const cacheTTLSeconds = asyncLocalStorage.getStore()?.get('cacheTTLSeconds');
              const cacheKey = asyncLocalStorage.getStore()?.get('cacheKey');

              let shouldLogRetryAttempts = props?.logRetry ?? true;

              if (typeof props?.logRetry === 'object') {
                shouldLogRetryAttempts = props?.logRetry.attempts ?? true;
              }

              let shouldLogRetryAttemptError = props?.logRetry ?? true;

              if (typeof props?.logRetry === 'object') {
                shouldLogRetryAttemptError = props?.logRetry.error ?? true;
              }

              let shouldLogCacheHit = props?.logCache ?? true;

              if (typeof props?.logCache === 'object') {
                shouldLogCacheHit = props?.logCache.hit ?? true;
              }

              let shouldLogCacheMiss = props?.logCache ?? true;

              if (typeof props?.logCache === 'object') {
                shouldLogCacheMiss = props?.logCache.miss ?? true;
              }

              let shouldLogCacheTTL = props?.logCache ?? true;

              if (typeof props?.logCache === 'object') {
                shouldLogCacheTTL = props?.logCache.ttl ?? true;
              }

              let shouldLogCacheKey = props?.logCache ?? true;

              if (typeof props?.logCache === 'object') {
                shouldLogCacheKey = props?.logCache.key ?? true;
              }

              let finalCacheHit;
              if (cacheHit === false && shouldLogCacheMiss) {
                finalCacheHit = false;
              } else if (shouldLogCacheHit) {
                finalCacheHit = cacheHit;
              }

              logger[finalLogLevel](props?.message ? `Finished: ${props.message}` : 'Finished calling method', {
                cacheHit: finalCacheHit,
                cacheKey: shouldLogCacheKey ? cacheKey : undefined,
                cacheTTL: shouldLogCacheTTL ? cacheTTLSeconds : undefined,
                category: props?.category,
                elapsedTimeMs,
                logId,
                method: fullyQualifiedName,
                result: outputArgsToLog,
                retryAttemptError: shouldLogRetryAttemptError ? retryAttemptError : undefined,
                retryAttempts: shouldLogRetryAttempts ? retryAttempts : undefined,
              });
            }
          }
        });
      },
    };
  };
