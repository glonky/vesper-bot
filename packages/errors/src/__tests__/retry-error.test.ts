import { RetryError } from '../retry-error';

describe('RetryError', () => {
  it('should be a subclass of Error', () => {
    const error = new RetryError('error');

    expect(error).toBeInstanceOf(Error);
  });

  it('should have the correct name', () => {
    const error = new RetryError('error');
    expect(error.name).toEqual(RetryError.name);
  });
});
