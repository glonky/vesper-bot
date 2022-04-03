import { assertion, AssertionError } from '../assertion-error';
import { NotFoundError } from '../not-found-error';

describe('Assertion', () => {
  describe('assertion function', () => {
    it('should throw an assertion error', () => {
      expect(() => {
        assertion('message', false);
      }).toThrowError(AssertionError);
    });

    it('should not throw an assertion error', () => {
      expect(() => {
        assertion('message', true);
      }).not.toThrowError(AssertionError);
    });

    it('should throw an custom error', () => {
      expect(() => {
        assertion('message', false, NotFoundError);
      }).toThrowError(NotFoundError);
    });

    it('should sets props on error', () => {
      expect.assertions(1);

      try {
        assertion('message', false, { foo: 'bar' });
      } catch (err) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect((err as any).foo).toBe('bar');
      }
    });

    it('should sets props on custom error', () => {
      expect.assertions(1);

      try {
        assertion('message', false, NotFoundError, { foo: 'bar' });
      } catch (err) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect((err as any).foo).toBe('bar');
      }
    });
  });

  describe('AssertionError', () => {
    it('should be a subclass of Error', () => {
      const error = new AssertionError('error');

      expect(error).toBeInstanceOf(Error);
    });

    it('should have the correct name', () => {
      const error = new AssertionError('error');
      expect(error.name).toEqual(AssertionError.name);
    });
  });
});
