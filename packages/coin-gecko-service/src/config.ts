import { Service } from 'typedi';
import { BaseConfig } from '@vesper-discord/config';

@Service()
export class Config extends BaseConfig {
  apiKey = this.getEnvVar<string>('COIN_GECKO_API_KEY');

  apiVersion = 'v3';

  baseUrl = 'https://api.coingecko.com/api';

  requestsPerSecond = this.getEnvVar<number>('COIN_GECKO_REQUESTS_PER_SECOND', 10);

  timeout = this.getEnvVar<number>('COIN_GECKO_TIMEOUT', 30000);
}
