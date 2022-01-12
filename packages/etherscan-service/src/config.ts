import { Service } from 'typedi';
import { BaseConfig } from '@vesper-discord/config';

@Service()
export class Config extends BaseConfig {
  apiKey = this.getEnvVar<string>('ETHERSCAN_API_KEY');

  baseUrl = 'https://api.etherscan.io/api';

  requestsPerSecond = this.getEnvVar<number>('ETHERSCAN_REQUESTS_PER_SECOND', 5);

  timeout = this.getEnvVar<number>('ETHERSCAN_TIMEOUT', 30000);
}
