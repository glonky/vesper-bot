import { PolygonBlockchainService } from '@vesper-discord/blockchain-service';
import { LoggerDecorator, Logger } from '@vesper-discord/logger';
import { Inject, Service } from 'typedi';
import { BlockchainScanServiceType } from './interfaces';
import { BlockchainScanService } from './service';

@Service()
export class PolygonScanService extends BlockchainScanService {
  @LoggerDecorator()
  protected readonly logger!: Logger;

  @Inject(() => PolygonBlockchainService)
  protected readonly blockchainService!: PolygonBlockchainService;

  protected get baseUrl() {
    return this.config.polygonscan.baseUrl;
  }

  protected get apiKey() {
    return this.config.polygonscan.apiKey;
  }

  protected get scanServiceType() {
    return BlockchainScanServiceType.POLYGON_SCAN;
  }
}
