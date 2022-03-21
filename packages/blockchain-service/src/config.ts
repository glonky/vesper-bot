import { Service } from 'typedi';
import { BaseConfig } from '@vesper-discord/config';
/**
homestead - Homestead (Mainnet)
ropsten - Ropsten (proof-of-work testnet)
rinkeby - Rinkeby (proof-of-authority testnet)
goerli - Görli (clique testnet)
kovan - Kovan (proof-of-authority testnet)
matic - Polygon
maticmum - Polygon Mumbai Testnet
optimism - Optimism (L2; optimistic roll-up)
optimism-kovan - Optimism Testnet (L2; optimistic roll-up testnet)
arbitrum - Arbitrum (L2; optimistic roll-up)
arbitrum-rinkeby - Arbitrum Testnet (L2; optimistic roll-up testnet)
 */
export type BlockchainNetwork =
  | 'homestead'
  | 'ropsten'
  | 'rinkeby'
  | 'goerli'
  | 'kovan'
  | 'matic'
  | 'maticmum'
  | 'optimism'
  | 'optimism-kovan'
  | 'arbitrum'
  | 'arbitrum-rinkeby';

@Service()
export class Config extends BaseConfig {
  network = this.getEnvVar<BlockchainNetwork>('BLOCKCHAIN_NETWORK', 'homestead');

  infura = {
    project: {
      id: this.getEnvVar<string>('INFURA_PROJECT_ID'),
      secret: this.getEnvVar<string>('INFURA_PROJECT_SECRET'),
    },
  };
}
