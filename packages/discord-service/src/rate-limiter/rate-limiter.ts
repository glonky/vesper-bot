import Container, { Service } from 'typedi';
import { CacheManager } from '@vesper-discord/redis-service';
import { Config } from '../config';

export interface ShouldRateLimitCommandProps {
  commandId: string;
  channelId: string;
  userId: string;
}

export interface SetCommandLastUsedProps {
  commandId: string;
  channelId: string;
  userId: string;
  ttl?: number;
}

@Service()
export class RateLimiter {
  public async shouldRateLimitCommand(props: ShouldRateLimitCommandProps) {
    const key = `${props.commandId}.${props.channelId}.${props.userId}`;

    if (!CacheManager.client) {
      throw Error('CacheManager must be set before calling shouldRateLimitCommand');
    }

    const result = await CacheManager.client.get(key);

    if (result) {
      return true;
    }

    return false;
  }

  public async setCommandLastUsed(props: SetCommandLastUsedProps) {
    const config = Container.get(Config);
    const key = `${props.commandId}.${props.channelId}.${props.userId}`;

    if (!CacheManager.client) {
      throw Error('CacheManager must be set before calling setCommandLastUsed');
    }

    await CacheManager.client.set(key, true, props.ttl ?? config.commandRateLimit);
  }
}
