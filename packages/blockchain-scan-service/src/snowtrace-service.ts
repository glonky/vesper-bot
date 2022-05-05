import { AvalancheBlockchainService } from '@vesper-discord/blockchain-service';
import { LoggerDecorator, Logger } from '@vesper-discord/logger';
import { Inject, Service } from 'typedi';
import { BlockchainScanServiceType } from './interfaces';
import { BlockchainScanService } from './service';

@Service()
export class SnowtraceService extends BlockchainScanService {
  @LoggerDecorator()
  protected readonly logger!: Logger;

  @Inject(() => AvalancheBlockchainService)
  protected readonly blockchainService!: AvalancheBlockchainService;

  protected get baseUrl() {
    return this.config.snowtrace.baseUrl;
  }

  protected get apiKey() {
    return this.config.snowtrace.apiKey;
  }

  protected get scanServiceType() {
    return BlockchainScanServiceType.SNOWTRACE;
  }
}
