import asyncRetry, { Options } from 'async-retry';
import { v4 as uuid } from 'uuid';
import Container from 'typedi';
import { Logger } from '@vesper-discord/logger';
import { NonRetriableError, RetriableError, ExtendedError, NotFoundError, RetryError } from '@vesper-discord/errors';
import { Config } from './config';
import { nonRetriableJavascriptErrors } from './javascript-errors';
export type BailOnError = typeof Error | typeof ExtendedError | string;
export interface RetryFunctionProps {
  retryAttempt: number;
}
export type RetryFunction<T> = (props: RetryFunctionProps) => T | Promise<T>;

export interface RetryProps extends Options {
  /**
   * This can either be an Error object or an extension of one, or a string.
   * For the Error object it will check to see if the thrown error is an instance of that Error.
   * If it is a string then it will check to see if the thrown error message includes that string.
   * Using error.message.includes(s)
   */
  bailOnErrors?: BailOnError[];
  retryDatabaseConflict?: boolean;
}

const activeRetries: { [retryId: string]: (error: Error) => void } = {};

process.on('uncaughtException', (err: Error) => cancelAllRetries(err, true, 'uncaughtException'));
process.on('unhandledRejection', (err: Error) => cancelAllRetries(err, true, 'unhandledRejection'));
process.on('SIGTERM', () => cancelAllRetries(null, true, 'SIGTERM'));
process.on('SIGINT', () => cancelAllRetries(null, true, 'SIGINT'));
process.on('SIGUSR2', () => cancelAllRetries(null, true, 'SIGTERM'));

// eslint-disable-next-line @typescript-eslint/ban-types
function cancelAllRetries(error?: {} | Error | string | null, shouldExitProcess = true, shutdownReason = 'SIGTERM') {
  const logger = Container.get(Logger);
  logger.debug('Received kill signal, bailing any active retries gracefully', {
    error,
    shutdownReason,
  });

  Object.entries(activeRetries).map(([retryId, bail]) => {
    logger.debug('Retry bail', {
      retryId,
    });

    return bail(new RetryError('Bailing because we are closing process'));
  });

  if (shouldExitProcess) {
    process.exit(1);
  }
}
/**
 * This will retry the provided function x number of times before bailing.
 * If passing in bailOnErrors array then it will bail early if it sees one of the provided errors.
 * It will automatically bail if a NonRetriableError was thrown.
 *
 * To calculate factor use the following resources
 *
 * https://www.wolframalpha.com/input/?i=Sum%5B1000*x%5Ek%2C+%7Bk%2C+0%2C+9%7D%5D+%3D+3+*+60+*+1000
 * http://www.exponentialbackoffcalculator.com/
 * @param fn The function to call (optionally async)
 * @param props AsyncRetry override options and bailOnErrors
 */
export async function retry<T>(fn: RetryFunction<T>, props?: RetryProps): Promise<T> {
  const logger = Container.get(Logger);
  const config = Container.get(Config);
  const { factor, maxTimeout, minTimeout, randomize, retries, forever, maxRetryTime } = config;

  const startTime = new Date();

  const overrides: Options = {
    factor,
    forever,
    maxRetryTime,
    maxTimeout,
    minTimeout,
    onRetry: (err: Error, retryCount: number) => {
      const errorToInspect = (err as ExtendedError).originalError ?? err;
      const timeElapsedMs = new Date().getTime() - startTime.getTime();
      logger.warn(`Retrying`, { error: errorToInspect, retryCount, timeElapsedMs });
    },
    randomize,
    retries,
    ...props,
  };

  const bailOnErrors = props?.bailOnErrors || [];
  bailOnErrors.push(NonRetriableError as any);
  bailOnErrors.push(...nonRetriableJavascriptErrors);

  let totalRetryAttempts = 0;
  const retryId = uuid();

  try {
    return await asyncRetry(async (bail, retryAttempt) => {
      totalRetryAttempts = retryAttempt;
      activeRetries[retryId] = bail;

      // eslint-disable-next-line no-async-promise-executor
      return new Promise<T>(async (resolve, reject) => {
        try {
          const result = await fn({ retryAttempt });
          delete activeRetries[retryId];
          return resolve(result);
        } catch (err) {
          delete activeRetries[retryId];
          const error = err as ExtendedError;

          const shouldBailForError = isErrorInBailOnErrors(bailOnErrors, error);
          const shouldBailForOriginalError = isErrorInBailOnErrors(bailOnErrors, error.originalError);
          const isRetriable = error instanceof RetriableError || error.originalError instanceof RetriableError;

          if ((shouldBailForError || shouldBailForOriginalError) && !isRetriable) {
            const wrappedError = new RetryError('Bailing because we found the error in bailOnErrors', {
              error,
            });
            bail(wrappedError);
            // eslint-disable-next-line consistent-return
            return;
          }

          if (!isRetriable) {
            const wrappedError = new RetryError('Bailing because we found the error in is not retriable', {
              error,
            });
            bail(wrappedError);
            // eslint-disable-next-line consistent-return
            return;
          }

          return reject(error);
        }
      });
    }, overrides);
  } catch (err) {
    // TODO: Report error here probably to sentry

    const timeElapsedMs = new Date().getTime() - startTime.getTime();
    if (err instanceof RetryError) {
      const { originalError } = err as RetryError;

      if (originalError instanceof NotFoundError) {
        logger.debug(
          'Throwing NotFoundError',
          {
            entityName: (originalError as any).entityName,
            error: originalError,
            timeElapsedMs,
          },
          { deep: false },
        );
      } else if (originalError) {
        logger.error('Failed and bailed early because we found RetryError, re-throwing originalError.', {
          error: originalError,
          timeElapsedMs,
          totalRetryAttempts,
        });

        throw originalError;
      }
    }

    logger.debug(`Failed to retry re-throwing.`, {
      error: err,
      timeElapsedMs,
      totalRetryAttempts,
    });

    throw err;
  }
}

function isErrorInBailOnErrors(bailOnErrors: BailOnError[], err?: Error) {
  if (!err) {
    return false;
  }

  return bailOnErrors.some((e) => {
    if (typeof e === 'function') {
      return err instanceof e;
    }

    return (
      err.message?.includes(e) ||
      (err as any).type?.includes(e) ||
      (err as any).code?.includes(e) ||
      (err as any).name?.includes(e)
    );
  });
}
