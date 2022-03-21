import { CacheClient, CacheStrategy, CacheStrategyContext } from '@type-cacheable/core';
import { asyncLocalStorage } from '@vesper-discord/container';

export class DefaultStrategy implements CacheStrategy {
  private pendingCacheRequestMap = new Map<string, Promise<any>>();

  private pendingMethodCallMap = new Map<string, Promise<any>>();

  private findCachedValue = async (client: CacheClient, key: string) => {
    let cachedValue: any;
    const pendingCachePromise = this.pendingCacheRequestMap.get(key);

    if (pendingCachePromise) {
      cachedValue = await pendingCachePromise;
    } else {
      const cachePromise = (client as any).redisClient.pipeline().ttl(key).get(key).exec();
      this.pendingCacheRequestMap.set(key, cachePromise);

      try {
        cachedValue = await cachePromise;
      } finally {
        this.pendingCacheRequestMap.delete(key);
      }
    }

    let result = cachedValue[1][1];

    if (result !== undefined && result !== null) {
      try {
        // Try to parse the string as JSON. This happens because we are using the ioredis pipeline function which always returns strings
        result = JSON.parse(result);
        // eslint-disable-next-line no-empty
      } catch (err) {}

      try {
        // Try to parse the string as number. This happens because we are using the ioredis pipeline function which always returns strings
        const number = Number(result);

        if (!Number.isNaN(number)) {
          result = number;
        }
        // eslint-disable-next-line no-empty
      } catch (err) {}

      const ttl = cachedValue[0][1];
      asyncLocalStorage.getStore()?.set('cacheHit', true);
      asyncLocalStorage.getStore()?.set('cacheTTLSeconds', ttl);
    }

    return result;
  };

  async handle(context: CacheStrategyContext): Promise<any> {
    try {
      const cachedValue = await this.findCachedValue(context.client, context.key);

      // If a value for the cacheKey was found in cache, simply return that.
      if (cachedValue !== undefined && cachedValue !== null) {
        return cachedValue;
      }
    } catch (err) {
      if (context.fallbackClient) {
        try {
          const cachedValue = await this.findCachedValue(context.fallbackClient, context.key);

          // If a value for the cacheKey was found in cache, simply return that.
          if (cachedValue !== undefined && cachedValue !== null) {
            return cachedValue;
          }
          // eslint-disable-next-line no-empty
        } catch (fallbackErr) {}
      }

      if (context.debug) {
        console.warn(
          `type-cacheable Cacheable cache miss on method ${context.originalMethod.name} due to client error: ${
            (err as Error).message
          }`,
        );
      }
    }

    // On a cache miss, run the decorated method and cache its return value.
    let result: any;
    const pendingMethodRun = this.pendingMethodCallMap.get(context.key);

    if (pendingMethodRun) {
      result = await pendingMethodRun;
    } else {
      // eslint-disable-next-line no-async-promise-executor
      const methodPromise = new Promise(async (resolve, reject) => {
        let returnValue;
        try {
          returnValue = await context.originalMethod?.apply(context.originalMethodScope, context.originalMethodArgs);
        } catch (err) {
          return reject(err);
        }

        try {
          await context.client.set(context.key, returnValue, context.ttl);
        } catch (err) {
          if (context.fallbackClient) {
            try {
              await context.fallbackClient.set(context.key, returnValue, context.ttl);
              // eslint-disable-next-line no-empty
            } catch (fallbackErr) {}
          }

          if (context.debug) {
            console.warn(
              `type-cacheable Cacheable set cache failure on method ${
                context.originalMethod.name
              } due to client error: ${(err as Error).message}`,
            );
          }
        }

        return resolve(returnValue);
      });

      try {
        this.pendingMethodCallMap.set(context.key, methodPromise);
        result = await methodPromise;
      } finally {
        this.pendingMethodCallMap.delete(context.key);
      }
    }

    asyncLocalStorage.getStore()?.set('cacheHit', false);

    return result;
  }
}
