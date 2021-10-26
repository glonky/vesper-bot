import IoRedis from 'ioredis';
import { useAdapter } from '@type-cacheable/ioredis-adapter';
import cacheManager from '@type-cacheable/core';
import Container from 'typedi';
import { Config } from '../config';

export class RedisService {
  static init() {
    const config = Container.get(Config);
    const client = new IoRedis({
      // host: config.redis.host,
      // port: config.redis.port,
      // tls: config.isDevelopment
      // ? undefined
      // : {
      // rejectUnauthorized: false,
      // },
    });
    const clientAdapter = useAdapter(client);
    cacheManager.setOptions({
      excludeContext: false,
    });
    cacheManager.setClient(clientAdapter);
  }
}
