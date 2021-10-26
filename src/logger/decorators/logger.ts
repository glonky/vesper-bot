import Container from 'typedi';
import { Logger } from '../logger';

export function LoggerDecorator(prefix?: string) {
  return function loggerDecorator(object: any, propertyName: string, index?: number) {
    Container.registerHandler({
      index,
      object,
      propertyName,
      value: (containerInstance) => {
        if (containerInstance.has(Logger)) {
          const logger = containerInstance.get(Logger);
          logger.trace(`Found in container instance`, {
            containerId: containerInstance.id,
            object,
            valueString: 'logger',
          });

          return logger;
        }

        if (Container.has(Logger)) {
          const logger = Container.get(Logger);
          logger.debug(`Found in global container`, { valueString: 'logger' });
          return logger;
        }

        return null;
      },
    });
  };
}
