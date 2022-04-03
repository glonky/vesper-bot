import { RetriableError } from '../retriable-error';

describe('RetriableError', () => {
  it('should be a subclass of Error', () => {
    const error = new RetriableError('error');

    expect(error).toBeInstanceOf(Error);
  });

  it('should have the correct name', () => {
    const error = new RetriableError('error');
    expect(error.name).toEqual(RetriableError.name);
  });
});
