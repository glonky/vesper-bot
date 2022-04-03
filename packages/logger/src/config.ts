import { Service } from 'typedi';
import { BaseConfig } from '@vesper-discord/config';

@Service()
export class Config extends BaseConfig {
  enabled = this.getEnvVar<boolean>('LOG_ENABLED');

  level = this.getEnvVar<string>('LOG_LEVEL', 'debug');

  sync = this.getEnvVar<boolean>('LOG_SYNC', this.isLocal);

  logDecoratorLevel = this.getEnvVar<'info' | 'debug' | 'trace'>('LOG_DECORATOR_LEVEL', 'debug');

  prettyPrint = this.getEnvVar<boolean>('LOG_PRETTY_PRINT', false);

  timestamp = this.getEnvVar<boolean>('LOG_TIMESTAMP', false);

  logToFile = this.getEnvVar<boolean>('LOG_TO_FILE', false);

  allLogFile = this.getEnvVar<string>('LOG_FILE', 'all.log');

  errorLogFile = this.getEnvVar<string>('LOG_ERROR_FILE', 'error.log');

  colors = this.getEnvVar<boolean>('LOG_COLORS', false);
}
