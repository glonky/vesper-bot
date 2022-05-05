/* eslint-disable no-console */
import path from 'node:path';
import { Service } from 'typedi';
import dotenv from 'dotenv-flow';
import { getEnvironmentVariable } from './get-environment-variable';

interface OverrideOptions extends dotenv.DotenvConfigOptions {
  silent: boolean;
}

@Service()
export class BaseConfig {
  private hasLoadedDotEnvFiles = false;

  private parsedDotEnvFiles!: dotenv.DotenvParseOutput;

  public nodeEnv = getEnvironmentVariable<'development' | 'staging' | 'test' | 'production'>('NODE_ENV', 'development');

  public isLocal = getEnvironmentVariable<boolean>('IS_LOCAL', false);

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

  public loadDotEnvFiles() {
    if (this.hasLoadedDotEnvFiles && this.parsedDotEnvFiles) {
      return this.parsedDotEnvFiles;
    }

    const nodeEnv = getEnvironmentVariable('NODE_ENV', 'development');
    const verboseConfig = getEnvironmentVariable<boolean>('CONFIG_VERBOSE', false);

    const baseConfigPath = path.join(__dirname, '../../..');

    if (baseConfigPath) {
      const baseConfigDotEnv = dotenv.config({
        node_env: nodeEnv,
        path: baseConfigPath,
        silent: !verboseConfig,
      } as OverrideOptions);

      if (baseConfigDotEnv.error) {
        console.error('Error loading base config', baseConfigDotEnv.error);
        throw baseConfigDotEnv.error;
      }

      if (!baseConfigDotEnv.parsed) {
        throw new Error('Error loading base config');
      }

      if (verboseConfig) {
        const baseConfigFileNames = dotenv.listDotenvFiles(baseConfigPath, { node_env: nodeEnv });
        console.log('Loading node env', {
          baseConfigFileNames,
          baseConfigPath,
          nodeEnv,
          parsed: baseConfigDotEnv.parsed,
        });
      }

      this.hasLoadedDotEnvFiles = true;
      this.parsedDotEnvFiles = baseConfigDotEnv.parsed;
    }

    return this.parsedDotEnvFiles;
  }

  public loadDotEnvFilesForAwsDeploy() {
    const {
      AWS_ACCESS_KEY_ID,
      AWS_REGION,
      AWS_SECRET_ACCESS_KEY,
      AWS_ACCOUNT,
      LOG_TO_FILE,
      LOG_COLORS,
      CDK_DEFAULT_STAGE,
      IS_LOCAL,
      AWS_PROFILE,
      ...envVars
    } = this.loadDotEnvFiles();
    return { ...envVars, NODE_ENV: this.nodeEnv };
  }
}
