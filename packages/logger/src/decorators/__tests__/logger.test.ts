import Container, { Service } from 'typedi';
import { Logger } from '../../logger';
import { LoggerDecorator } from '../logger';

describe('logger', () => {
  it('should set the correct log level', () => {
    const logger = Container.get(Logger);
    const infoSpy = jest.spyOn(logger, 'info');

    @Service()
    class TestClass {
      @LoggerDecorator()
      public logger!: Logger;

      public logMe() {
        this.logger.info('log me');
      }
    }

    const testClass = Container.get(TestClass);
    testClass.logMe();

    expect(infoSpy).toHaveBeenCalled();
  });
});
