import { NonRetriableError } from '../non-retriable-error';

describe('NonRetriableError', () => {
  it('should be a subclass of Error', () => {
    const error = new NonRetriableError('error');

    expect(error).toBeInstanceOf(Error);
  });

  it('should have the correct name', () => {
    const error = new NonRetriableError('error');
    expect(error.name).toEqual(NonRetriableError.name);
  });
});
