import { EthereumBlockchainService } from '@vesper-discord/blockchain-service';
import { LoggerDecorator, Logger } from '@vesper-discord/logger';
import { Inject, Service } from 'typedi';
import { BlockchainScanServiceType } from './interfaces';
import { BlockchainScanService } from './service';

@Service()
export class EtherscanService extends BlockchainScanService {
  @LoggerDecorator()
  protected readonly logger!: Logger;

  @Inject(() => EthereumBlockchainService)
  protected readonly blockchainService!: EthereumBlockchainService;

  protected get baseUrl() {
    return this.config.etherscan.baseUrl;
  }

  protected get apiKey() {
    return this.config.etherscan.apiKey;
  }

  protected get scanServiceType() {
    return BlockchainScanServiceType.ETHERSCAN;
  }
}
