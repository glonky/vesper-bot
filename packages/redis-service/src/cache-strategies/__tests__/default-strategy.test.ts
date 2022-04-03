import { asyncLocalStorage } from '@vesper-discord/container';
import { DefaultStrategy } from '../default-strategy';

describe('CacheStrategies | DefaultStrategy', () => {
  const clientMockSetKey = jest.fn();
  const clientMockGetKey = jest.fn();
  const clientMockExecPipeline = jest.fn();
  const originalMethod = jest.fn();

  const client = {
    del: jest.fn(),
    delHash: jest.fn(),
    get: clientMockGetKey,
    getClientTTL: jest.fn(),
    keys: jest.fn(),
    redisClient: {
      pipeline: () => {
        return {
          ttl: () => {
            return {
              get: () => {
                return {
                  exec: clientMockExecPipeline,
                };
              },
            };
          },
        };
      },
    },
    set: clientMockSetKey,
  };

  const cacheKey = 'cacheKey';
  const cacheValue = 'value';
  const cacheTTLSeconds = 1;
  const cacheStrategy = new DefaultStrategy();
  const originalMethodScope = {
    constructor: {
      name: 'TestClass',
    },
  };
  const originalPropertyKey = 'testMethod';
  const handleProps = {
    client,
    debug: false,
    fallbackClient: null,
    key: cacheKey,
    originalMethod,
    originalMethodArgs: [],
    originalMethodScope,
    originalPropertyKey,
    ttl: cacheTTLSeconds,
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return the correct cache value', async () => {
    expect.assertions(1);

    const store = new Map();

    await asyncLocalStorage.run(store, async () => {
      clientMockExecPipeline.mockReturnValue(
        Promise.resolve([
          ['ttl', cacheTTLSeconds],
          [cacheKey, cacheValue],
        ]),
      );
      const cacheResult = await cacheStrategy.handle(handleProps);

      expect(cacheResult).toBe(cacheValue);
    });
  });

  it('should return null when there is no value from cache', async () => {
    expect.assertions(1);

    const store = new Map();

    await asyncLocalStorage.run(store, async () => {
      clientMockExecPipeline.mockReturnValue(Promise.resolve([]));
      const cacheResult = await cacheStrategy.handle(handleProps);

      expect(cacheResult).toBeUndefined();
    });
  });

  it('should add a cache key to the asyncLocalStorage', async () => {
    expect.assertions(1);

    const store = new Map();

    await asyncLocalStorage.run(store, async () => {
      clientMockExecPipeline.mockReturnValue(
        Promise.resolve([
          ['ttl', cacheTTLSeconds],
          [cacheKey, cacheValue],
        ]),
      );
      await cacheStrategy.handle(handleProps);

      const cacheKeyFromAsyncLocalStorage = asyncLocalStorage.getStore()?.get('cacheKey');
      const finalCacheKey = `${originalMethodScope.constructor.name}.${originalPropertyKey}:${cacheKey}`;

      expect(cacheKeyFromAsyncLocalStorage).toBe(finalCacheKey);
    });
  });

  it('should add a cache hit flag to the asyncLocalStorage', async () => {
    expect.assertions(1);

    const store = new Map();

    await asyncLocalStorage.run(store, async () => {
      clientMockExecPipeline.mockReturnValue(
        Promise.resolve([
          ['ttl', cacheTTLSeconds],
          [cacheKey, cacheValue],
        ]),
      );

      await cacheStrategy.handle(handleProps);

      const cacheKeyFromAsyncLocalStorage = asyncLocalStorage.getStore()?.get('cacheHit');

      expect(cacheKeyFromAsyncLocalStorage).toBeTruthy();
    });
  });

  it('should add a cache ttl flag to the asyncLocalStorage', async () => {
    expect.assertions(1);

    const store = new Map();

    await asyncLocalStorage.run(store, async () => {
      clientMockExecPipeline.mockReturnValue(
        Promise.resolve([
          ['ttl', cacheTTLSeconds],
          [cacheKey, cacheValue],
        ]),
      );

      await cacheStrategy.handle(handleProps);

      const cacheKeyFromAsyncLocalStorage = asyncLocalStorage.getStore()?.get('cacheTTLSeconds');

      expect(cacheKeyFromAsyncLocalStorage).toBe(cacheTTLSeconds);
    });
  });

  it('should', async () => {
    expect.assertions(1);

    const store = new Map();

    await asyncLocalStorage.run(store, async () => {
      clientMockExecPipeline.mockReturnValue(
        Promise.resolve([
          ['ttl', cacheTTLSeconds],
          [cacheKey, cacheValue],
        ]),
      );

      await cacheStrategy.handle(handleProps);

      const cacheKeyFromAsyncLocalStorage = asyncLocalStorage.getStore()?.get('cacheTTLSeconds');

      expect(cacheKeyFromAsyncLocalStorage).toBe(cacheTTLSeconds);
    });
  });
});
