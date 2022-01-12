import { merge } from 'lodash';
import Container from 'typedi';
import { ErrorProps, Logger, LoggerProps, OptionalProps } from '../logger';

export function LoggerDecorator(loggerName?: string) {
  return function loggerDecorator(object: any, propertyName: string, index?: number) {
    Container.registerHandler({
      index,
      object,
      propertyName,
      value: (containerInstance) => {
        loggerName = loggerName ?? object.constructor.name;

        if (containerInstance.has(Logger)) {
          let logger = containerInstance.get(Logger);
          logger = addLoggerNameToDecoratedLogger(logger, loggerName);
          logger.trace(`Found in container instance`, {
            containerId: containerInstance.id,
            object,
            valueString: 'logger',
          });

          return logger;
        }

        if (Container.has(Logger)) {
          let logger = Container.get(Logger);
          logger = addLoggerNameToDecoratedLogger(logger, loggerName);
          logger.trace(`Found in global container`, { valueString: 'logger' });
          return logger;
        }

        return null;
      },
    });
  };
}

function addLoggerNameToDecoratedLogger(logger: Logger, loggerName?: string) {
  if (!loggerName) {
    return logger;
  }

  return {
    debug: (message: string, optionalProps?: OptionalProps, loggerProps?: LoggerProps) =>
      logger.debug(message, merge({ logger: loggerName }, optionalProps ?? {}), loggerProps),
    error: (message: string, optionalProps?: OptionalProps & ErrorProps, loggerProps?: LoggerProps) =>
      logger.error(message, merge({ logger: loggerName }, optionalProps ?? {}), loggerProps),
    fatal: (message: string, optionalProps?: OptionalProps, loggerProps?: LoggerProps) =>
      logger.fatal(message, merge({ logger: loggerName }, optionalProps ?? {}), loggerProps),
    info: (message: string, optionalProps?: OptionalProps, loggerProps?: LoggerProps) =>
      logger.info(message, merge({ logger: loggerName }, optionalProps ?? {}), loggerProps),
    trace: (message: string, optionalProps?: OptionalProps, loggerProps?: LoggerProps) =>
      logger.trace(message, merge({ logger: loggerName }, optionalProps ?? {}), loggerProps),
    warn: (message: string, optionalProps?: OptionalProps, loggerProps?: LoggerProps) =>
      logger.warn(message, merge({ logger: loggerName }, optionalProps ?? {}), loggerProps),
  } as Logger;
}
