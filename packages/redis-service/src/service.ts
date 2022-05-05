import IoRedis from 'ioredis';
import { useAdapter } from '@type-cacheable/ioredis-adapter';
import cacheManager from '@type-cacheable/core';
import { Container, Service } from 'typedi';
import { Config } from './config';
import { DefaultStrategy } from './cache-strategies/index';

@Service()
export class RedisService {
  private isInitialized = false;

  init() {
    if (this.isInitialized) {
      return;
    }

    const config = Container.get(Config);
    const isLocalhost = config.host.includes('localhost');
    const client = new IoRedis(config.host, {
      db: config.isTest ? 1 : undefined,
      keepAlive: isLocalhost ? 1 : 0,
      tls: isLocalhost
        ? undefined
        : {
            rejectUnauthorized: false,
          },
    });
    const clientAdapter = useAdapter(client);
    cacheManager.setOptions({
      debug: config.isDevelopment,
      excludeContext: false,
      strategy: new DefaultStrategy(),
      ttlSeconds: config.ttl,
    });
    cacheManager.setClient(clientAdapter);

    this.isInitialized = true;

    return client;
  }
}
