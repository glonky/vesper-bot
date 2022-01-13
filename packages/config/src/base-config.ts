/* eslint-disable no-console */
import path from 'path';
import { Service } from 'typedi';
import dotenv from 'dotenv-flow';
import { getEnvironmentVariable } from './get-environment-variable';

interface OverrideOptions extends dotenv.DotenvConfigOptions {
  silent: boolean;
}

@Service()
export class BaseConfig {
  private hasLoadedDotEnvFiles = false;

  public nodeEnv = getEnvironmentVariable<'development' | 'staging' | 'test' | 'production'>('NODE_ENV', 'development');

  public isLocal = getEnvironmentVariable<boolean>('LOCAL', false);

  public isCI = getEnvironmentVariable<boolean>('CI', false);

  protected getEnvVar = getEnvironmentVariable;

  public get isProduction() {
    return this.nodeEnv.includes('prod');
  }

  public get isDevelopment() {
    return this.nodeEnv.includes('development');
  }

  public get isStaging() {
    return this.nodeEnv.includes('staging');
  }

  public get isTest() {
    return this.nodeEnv.includes('test');
  }

  public loadDotEnvFiles(pathToEnvFiles?: string) {
    if (this.hasLoadedDotEnvFiles) {
      return;
    }

    const nodeEnv = getEnvironmentVariable('NODE_ENV', 'development');
    const verboseConfig = getEnvironmentVariable<boolean>('CONFIG_VERBOSE', false);

    const baseConfigPath = pathToEnvFiles ?? path.resolve('.');

    if (baseConfigPath) {
      const baseConfigDotEnv = dotenv.config({
        node_env: nodeEnv,
        path: baseConfigPath,
        silent: !verboseConfig,
      } as OverrideOptions);

      if (verboseConfig) {
        const baseConfigFileNames = dotenv.listDotenvFiles(baseConfigPath, { node_env: nodeEnv });
        console.log('Loading node env', {
          baseConfigFileNames,
          baseConfigPath,
          nodeEnv,
          parsed: baseConfigDotEnv.parsed,
        });
      }
    } else if (!baseConfigPath && verboseConfig) {
      console.warn(`Could not find package.json for baseConfigPath ${__dirname}`);
    }

    this.hasLoadedDotEnvFiles = true;
  }
}
