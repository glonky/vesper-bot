import { ExtendedError } from '../extended-error';
import { NotFoundError } from '../not-found-error';

describe('ExtendedError', () => {
  it('should be a subclass of Error', () => {
    const error = new ExtendedError('error');

    expect(error).toBeInstanceOf(Error);
  });

  it('should have the correct name', () => {
    const error = new ExtendedError('error');
    expect(error.name).toEqual(ExtendedError.name);
  });

  it('should set the extended props on the error', () => {
    class FooError extends ExtendedError {
      public foo?: string;
    }
    const error = new FooError('error', {
      foo: 'bar',
    });
    expect(error.foo).toEqual('bar');
  });

  it('should set the original the error', () => {
    const error = new ExtendedError('error', {
      error: new NotFoundError('not found'),
    });

    expect(error.originalError).toBeInstanceOf(NotFoundError);
  });

  it('should remove any undefined properties passed in through props', () => {
    class FooError extends ExtendedError {
      public foo?: string;
    }
    const error = new FooError('error', {
      foo: undefined,
    });

    expect(error.foo).toBeUndefined();
  });

  it('should not remove null properties passed in through props', () => {
    class FooError extends ExtendedError {
      public foo?: string;
    }
    const error = new FooError('error', {
      foo: null,
    });

    expect(error.foo).toBeNull();
  });

  it('should call inspect on object props', () => {
    class FooError extends ExtendedError {
      public foo?: {
        bar: string;
      };
    }
    const error = new FooError('error', {
      foo: {
        bar: 'baz',
      },
    });

    expect(error.foo).toStrictEqual({
      bar: 'baz',
    });
  });
});
