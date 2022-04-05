import { Service } from 'typedi';
import { BaseConfig } from '@vesper-discord/config';

@Service()
export class Config extends BaseConfig {
  aws = {
    accessKeyId: this.getEnvVar<string>('AWS_ACCESS_KEY_ID'),
    account: this.getEnvVar<string>('CDK_DEFAULT_ACCOUNT' || 'AWS_ACCOUNT'),
    region: this.getEnvVar<string>('CDK_DEFAULT_REGION' || 'AWS_DEFAULT_REGION' || 'AWS_REGION', 'us-west-2'),
    resources: {
      tables: {
        vesperSingleTable: this.getEnvVar<string>('AWS_RESOURCE_VESPER_SINGLE_TABLE'),
      },
    },
    secretAccessKey: this.getEnvVar<string>('AWS_SECRET_ACCESS_KEY'),
    sessionToken: this.getEnvVar<string>('AWS_SESSION_TOKEN'),
    stage: this.getEnvVar<string>('CDK_DEFAULT_STAGE', this.nodeEnv === 'production' ? 'prod' : 'staging'),
  };
}
