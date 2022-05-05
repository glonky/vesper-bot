import { Container } from 'typedi';
import { Logger } from '../logger';

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

          if (loggerName) {
            logger = logger.setName(loggerName);
          }

          logger.trace(`Found in container instance`, {
            containerId: containerInstance.id,
            object,
            valueString: 'logger',
          });

          return logger;
        }

        if (Container.has(Logger)) {
          const logger = Container.get(Logger);

          logger.trace(`Found in global container`, { valueString: 'logger' });
          return logger;
        }

        return null;
      },
    });
  };
}
