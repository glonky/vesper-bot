import { Service } from 'typedi';
import { BaseConfig } from '@vesper-discord/config';

@Service()
export class Config extends BaseConfig {
  network = this.getEnvVar<string>('HARDHAT_NETWORK');

  infura = {
    project: {
      id: this.getEnvVar<string>('INFURA_PROJECT_ID'),
      secret: this.getEnvVar<string>('INFURA_PROJECT_SECRET'),
    },
  };
}
