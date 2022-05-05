import { Service } from 'typedi';
import { BaseConfig } from '@vesper-discord/config';

@Service()
export class Config extends BaseConfig {
  aws = {
    resources: {
      tables: {
        vesperSingleTable: this.getEnvVar<string>('AWS_RESOURCE_VESPER_SINGLE_TABLE'),
      },
    },
  };
}
