import { Service } from 'typedi';
import { BaseConfig } from '@vesper-discord/config';

@Service()
export class Config extends BaseConfig {
  account = this.getEnvVar<string>('CDK_DEFAULT_ACCOUNT' || 'AWS_ACCOUNT' || 'SHUFFL_AWS_ACCOUNT');

  region = this.getEnvVar<string>('CDK_DEFAULT_REGION' || 'AWS_DEFAULT_REGION' || 'AWS_REGION', 'us-east-1');

  profile = this.getEnvVar<string>('AWS_PROFILE', 'vesper-discord-staging');

  captureAwsXray = this.getEnvVar<boolean>('AWS_CAPTURE_AWS_XRAY', false);

  mockAwsServices = this.getEnvVar<boolean>('MOCK_AWS_SERVICES', this.isLocal);
}
