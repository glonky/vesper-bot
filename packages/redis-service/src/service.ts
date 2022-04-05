import IoRedis from 'ioredis';
import { useAdapter } from '@type-cacheable/ioredis-adapter';
import cacheManager from '@type-cacheable/core';
import Container, { Service } from 'typedi';
import { Config } from './config';
import { DefaultStrategy } from './cache-strategies';

@Service()
export class RedisService {
  private isInitialized = false;

  init() {
    if (this.isInitialized) {
      return;
    }

    const config = Container.get(Config);
    const client = new IoRedis(config.host, {
      db: config.isTest ? 1 : 0,
      tls:
        config.isDevelopment || config.isLocal || config.isTest
          ? undefined
          : {
              rejectUnauthorized: false,
            },
    });
    const clientAdapter = useAdapter(client);
    cacheManager.setOptions({
      excludeContext: false,
      strategy: new DefaultStrategy(),
      ttlSeconds: config.ttl,
    });
    cacheManager.setClient(clientAdapter);

    this.isInitialized = true;

    return client;
  }
}
