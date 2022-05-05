import { LoggerDecorator, Logger } from '@vesper-discord/logger';
import { ethers } from 'ethers';
import { Service } from 'typedi';
import { BlockchainService } from './service';

@Service()
export class AvalancheBlockchainService extends BlockchainService {
  @LoggerDecorator()
  protected readonly logger!: Logger;

  public get provider() {
    const url = this.config.avalanche[this.config.avalancheNetwork];
    return new ethers.providers.JsonRpcProvider(url);
  }
}
