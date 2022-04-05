import { NotProxyAddressError } from '../not-proxy-address-error';

describe('NotProxyAddressError', () => {
  it('should be a subclass of Error', () => {
    const error = new NotProxyAddressError('error', {});

    expect(error).toBeInstanceOf(Error);
  });

  it('should have the correct name', () => {
    const error = new NotProxyAddressError('error', {});
    expect(error.name).toEqual(NotProxyAddressError.name);
  });

  it('should be instanceof NotProxyAddressError', () => {
    expect(() => {
      throw new NotProxyAddressError('err', {});
    }).toThrowError(NotProxyAddressError);
  });
});
