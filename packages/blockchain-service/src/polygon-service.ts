import { LoggerDecorator, Logger } from '@vesper-discord/logger';
import { ethers } from 'ethers';
import { Service } from 'typedi';
import { BlockchainService } from './service';

@Service()
export class PolygonBlockchainService extends BlockchainService {
  @LoggerDecorator()
  protected readonly logger!: Logger;

  public get provider() {
    return new ethers.providers.InfuraProvider('matic', {
      projectId: this.config.infura.projectId,
      projectSecret: this.config.infura.projectSecret,
    });
  }
}
