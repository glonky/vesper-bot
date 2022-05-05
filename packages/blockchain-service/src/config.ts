import { Service } from 'typedi';
import { BaseConfig } from '@vesper-discord/config';

@Service()
export class Config extends BaseConfig {
  avalancheNetwork = this.getEnvVar<'mainnet'>('BLOCKCHAIN_AVALANCHE_NETWORK', 'mainnet');

  ethereumNetwork = this.getEnvVar<'mainnet'>('BLOCKCHAIN_ETHEREUM_NETWORK', 'mainnet');

  polygonNetwork = this.getEnvVar<'mainnet'>('BLOCKCHAIN_POLYGON_NETWORK', 'mainnet');

  infura = {
    projectId: this.getEnvVar<string>('INFURA_PROJECT_ID'),
    projectSecret: this.getEnvVar<string>('INFURA_PROJECT_SECRET'),
  };

  avalanche = {
    mainnet: 'https://speedy-nodes-nyc.moralis.io/d6ffd0dd8dee13349fc66f4f/avalanche/mainnet',
  };

  ethereum = {
    mainnet: 'https://mainnet.infura.io/v3/',
  };

  polygon = {
    mainnet: 'https://speedy-nodes-nyc.moralis.io/d6ffd0dd8dee13349fc66f4f/polygon/mainnet',
  };
}
