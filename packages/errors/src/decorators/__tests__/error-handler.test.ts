import { ErrorHandler } from '..';
import { ErrorConverter } from '../../error-converter';
import { ExtendedError } from '../../extended-error';

describe('ErrorHandler', () => {
  it('should throw the correct converted error', () => {
    class FooError extends ExtendedError {
      constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, FooError.prototype);

        this.name = this.constructor.name;
      }
    }

    class FooErrorConverter implements ErrorConverter<FooError> {
      convertError() {
        return new FooError('FooError');
      }
    }

    class FooClass {
      @ErrorHandler({ converter: FooErrorConverter })
      fnThatThrowsError() {
        throw new Error('ExtendedError');
      }
    }

    const fooInstance = new FooClass();
    expect(() => fooInstance.fnThatThrowsError()).toThrowError(FooError);
  });

  it('should throw the original error if the error is already ExtendedError', () => {
    class FooError extends ExtendedError {
      constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, FooError.prototype);

        this.name = this.constructor.name;
      }
    }

    class FooErrorConverter implements ErrorConverter<FooError> {
      convertError() {
        return new FooError('FooError');
      }
    }

    class FooClass {
      @ErrorHandler({ converter: FooErrorConverter })
      fnThatThrowsError() {
        throw new ExtendedError('ExtendedError');
      }
    }

    const fooInstance = new FooClass();
    expect(() => fooInstance.fnThatThrowsError()).toThrowError(ExtendedError);
  });

  it('should set the errorHandlerMessage on the converted error', () => {
    expect.assertions(1);

    class FooError extends ExtendedError {
      constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, FooError.prototype);

        this.name = this.constructor.name;
      }
    }

    class FooErrorConverter implements ErrorConverter<FooError> {
      convertError() {
        return new FooError('FooError');
      }
    }

    class FooClass {
      @ErrorHandler({ converter: FooErrorConverter })
      fnThatThrowsError() {
        throw new Error('ExtendedError');
      }
    }

    const fooInstance = new FooClass();
    try {
      fooInstance.fnThatThrowsError();
    } catch (err) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect((err as any).errorHandlerMessage).toBeDefined();
    }
  });

  it('should throw the converted error on async function', async () => {
    class FooError extends ExtendedError {
      constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, FooError.prototype);

        this.name = this.constructor.name;
      }
    }

    class FooErrorConverter implements ErrorConverter<FooError> {
      convertError() {
        return new FooError('FooError');
      }
    }

    class FooClass {
      @ErrorHandler({ converter: FooErrorConverter })
      async fnThatThrowsError() {
        throw new Error('ExtendedError');
      }
    }

    const fooInstance = new FooClass();
    await expect(() => fooInstance.fnThatThrowsError()).rejects.toThrowError(FooError);
  });
});
