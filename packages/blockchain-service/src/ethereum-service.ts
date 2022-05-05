import { LoggerDecorator, Logger } from '@vesper-discord/logger';
import { ethers } from 'ethers';
import { Service } from 'typedi';
import { BlockchainService } from './service';

@Service()
export class EthereumBlockchainService extends BlockchainService {
  @LoggerDecorator()
  protected readonly logger!: Logger;

  public get provider() {
    return new ethers.providers.InfuraProvider('homestead', {
      projectId: this.config.infura.projectId,
      projectSecret: this.config.infura.projectSecret,
    });
  }
}
