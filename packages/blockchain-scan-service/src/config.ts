import { Service } from 'typedi';
import { BaseConfig } from '@vesper-discord/config';

@Service()
export class Config extends BaseConfig {
  etherscan = {
    apiKey: this.getEnvVar<string>('ETHERSCAN_API_KEY'),
    baseUrl: 'https://api.etherscan.io/api',
  };

  snowtrace = {
    apiKey: this.getEnvVar<string>('SNOWTRACE_API_KEY'),
    baseUrl: 'https://api.snowtrace.io/api',
  };

  polygonscan = {
    apiKey: this.getEnvVar<string>('POLYGONSCAN_API_KEY'),
    baseUrl: 'https://api.polygonscan.com/api',
  };
}
