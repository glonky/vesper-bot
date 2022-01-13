import IoRedis from 'ioredis';
import { useAdapter } from '@type-cacheable/ioredis-adapter';
import cacheManager from '@type-cacheable/core';
import Container, { Service } from 'typedi';
import { Config } from './config';

@Service()
export class RedisService {
  private isInitialized = false;

  init() {
    if (this.isInitialized) {
      return;
    }

    const config = Container.get(Config);
    const client = new IoRedis(config.host, {
      tls: config.isDevelopment
        ? undefined
        : {
            rejectUnauthorized: false,
          },
    });
    const clientAdapter = useAdapter(client);
    cacheManager.setOptions({
      excludeContext: false,
    });
    cacheManager.setClient(clientAdapter);

    this.isInitialized = true;
  }
}
