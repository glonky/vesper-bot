import { Service } from 'typedi';
import { BaseConfig } from '@vesper-discord/config';

@Service()
export class Config extends BaseConfig {
  factor = this.getEnvVar<number>('RETRY_FACTOR', 2);

  maxTimeout = this.getEnvVar<number>('RETRY_MAX_TIMEOUT_MS', 30000);

  minTimeout = this.getEnvVar<number>('RETRY_MIN_TIMEOUT_MS', 1000);

  randomize = this.getEnvVar<boolean>('RETRY_RANDOMIZE', true);

  retries = this.getEnvVar<number>('RETRY_RETRIES', 3);

  forever = this.getEnvVar<boolean>('RETRY_FOREVER', true);

  maxRetryTime = this.getEnvVar<number>('RETRY_MAX_RETRY_TIME', Infinity);
}
