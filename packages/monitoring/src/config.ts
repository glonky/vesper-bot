import { BaseConfig } from '@vesper-discord/config';

import { Service } from 'typedi';

@Service()
export class Config extends BaseConfig {
  logLevel = this.getEnvVar<'info' | 'debug' | 'trace'>('MONITOR_LOG_LEVEL', 'debug');
}
