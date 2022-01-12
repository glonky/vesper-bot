import { merge } from 'lodash';
import Container from 'typedi';
import { ErrorProps, Logger, LoggerProps, OptionalProps } from '../logger';

export function LoggerDecorator(prefix?: string) {
  return function loggerDecorator(object: any, propertyName: string, index?: number) {
    Container.registerHandler({
      index,
      object,
      propertyName,
      value: (containerInstance) => {
        prefix = prefix ?? object.constructor.name;

        if (containerInstance.has(Logger)) {
          let logger = containerInstance.get(Logger);
          logger = addPrefixToDecoratedLogger(logger, prefix);
          logger.trace(`Found in container instance`, {
            containerId: containerInstance.id,
            object,
            valueString: 'logger',
          });

          return logger;
        }

        if (Container.has(Logger)) {
          let logger = Container.get(Logger);
          logger = addPrefixToDecoratedLogger(logger, prefix);
          logger.trace(`Found in global container`, { valueString: 'logger' });
          return logger;
        }

        return null;
      },
    });
  };
}

function addPrefixToDecoratedLogger(logger: Logger, prefix?: string) {
  if (!prefix) {
    return logger;
  }

  return {
    debug: (message: string, optionalProps?: OptionalProps, loggerProps?: LoggerProps) =>
      logger.debug(message, merge({ prefix }, optionalProps ?? {}), loggerProps),
    error: (message: string, optionalProps?: OptionalProps & ErrorProps, loggerProps?: LoggerProps) =>
      logger.error(message, merge({ prefix }, optionalProps ?? {}), loggerProps),
    fatal: (message: string, optionalProps?: OptionalProps, loggerProps?: LoggerProps) =>
      logger.fatal(message, merge({ prefix }, optionalProps ?? {}), loggerProps),
    info: (message: string, optionalProps?: OptionalProps, loggerProps?: LoggerProps) =>
      logger.info(message, merge({ prefix }, optionalProps ?? {}), loggerProps),
    trace: (message: string, optionalProps?: OptionalProps, loggerProps?: LoggerProps) =>
      logger.trace(message, merge({ prefix }, optionalProps ?? {}), loggerProps),
    warn: (message: string, optionalProps?: OptionalProps, loggerProps?: LoggerProps) =>
      logger.warn(message, merge({ prefix }, optionalProps ?? {}), loggerProps),
  } as Logger;
}
