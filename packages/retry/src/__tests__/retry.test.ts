import { NonRetriableError, NotFoundError } from '@vesper-discord/errors';
import { retry } from '../retry';

describe('retry', () => {
  it('returns successfully', async () => {
    const expected = 'hi';
    const fn = jest.fn().mockResolvedValue(expected);

    await expect(retry(fn)).resolves.toBe(expected);
    expect(fn).toBeCalledTimes(1);
  });

  it('async types work correctly', async () => {
    const expected = {
      data: 'hi',
    };

    const fn: jest.Mock<typeof expected> = jest.fn().mockResolvedValue(expected);

    const actual = await retry(fn);
    expect(actual.data).toStrictEqual(expected.data);
    expect(fn).toBeCalledTimes(1);
  });

  it('retries the set amount of times and then throws', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('Actual error'));

    await expect(retry(fn, { maxTimeout: 0, minTimeout: 0, retries: 1 })).rejects.toThrowError(Error);
    expect(fn).toBeCalledTimes(1);
  });

  it('bails correctly with wrapped error when setting bailedOnErrors error', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('Bailing early with error'));

    await expect(retry(fn, { bailOnErrors: [Error] })).rejects.toThrowError(Error);
    expect(fn).toBeCalledTimes(1);
  });

  it('bails correctly with wrapped error', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('Bailing early with error'));

    await expect(retry(fn, { bailOnErrors: [Error] })).rejects.toBeInstanceOf(Error);
  });

  it('bails correctly with wrapped NonRetriableError', async () => {
    const fn = jest.fn().mockRejectedValue(new NonRetriableError('Bailing early with wrapped NonRetriableError'));

    await expect(retry(fn)).rejects.toBeInstanceOf(NonRetriableError);
    expect(fn).toBeCalledTimes(1);
  });

  it('bails correctly when setting bailedOnErrors string', async () => {
    const errorMessage = 'Bailing early with string';
    const fn = jest.fn().mockRejectedValue(new Error(errorMessage));

    await expect(retry(fn, { bailOnErrors: [errorMessage] })).rejects.toThrowError(Error);
    expect(fn).toBeCalledTimes(1);
  });

  it('bails correctly when setting bailedOnErrors to custom Error', async () => {
    const fn = jest.fn().mockRejectedValue(new NotFoundError('Bailing with not found'));

    await expect(retry(fn, { bailOnErrors: [NotFoundError as any] })).rejects.toThrowError(NonRetriableError);
    expect(fn).toBeCalledTimes(1);
  });
});
