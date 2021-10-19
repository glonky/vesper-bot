/* eslint-disable no-console */
import path from 'path';
import dotenv from 'dotenv-flow';
import { Service } from 'typedi';
import { getEnvVar } from './get-env-var';

interface OverrideOptions extends dotenv.DotenvConfigOptions {
  silent: boolean;
}

@Service()
export abstract class BaseConfig {
  nodeEnv = getEnvVar<string>(process.env.NODE_ENV, 'development');

  get isProduction() {
    return this.nodeEnv.includes('prod');
  }

  get isDevelopment() {
    return this.nodeEnv.includes('development');
  }

  get isStaging() {
    return this.nodeEnv.includes('staging');
  }

  get isTest() {
    return this.nodeEnv.includes('test');
  }

  protected getEnvVar = getEnvVar;

  // eslint-disable-next-line @typescript-eslint/member-ordering
  isLocal = this.getEnvVar<boolean>(process.env.LOCAL, false);

  private verboseConfig = this.getEnvVar<boolean>(process.env.CONFIG_VERBOSE, false);

  constructor() {
    const baseConfigPath = path.join(__dirname, '..', '..');
    if (baseConfigPath) {
      const baseConfigDotEnv = dotenv.config({
        node_env: this.nodeEnv,
        path: baseConfigPath,
        silent: !this.verboseConfig,
      } as OverrideOptions);

      if (this.verboseConfig) {
        const baseConfigFileNames = dotenv.listDotenvFiles(baseConfigPath, { node_env: this.nodeEnv });
        console.log('Loading base config folder', baseConfigPath);
        console.log('Loading base config env files', baseConfigFileNames);
        console.log('base env', baseConfigDotEnv.parsed);
        console.log('Node env is', this.nodeEnv);
      }
    } else if (!baseConfigPath && this.verboseConfig) {
      console.warn(`Could not find package.json for baseConfigPath ${__dirname}`);
    }
  }

  protected abstract getPathToEnvFiles(): string;
}
