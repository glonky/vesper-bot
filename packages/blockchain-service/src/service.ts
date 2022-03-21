import { Inject, Service } from 'typedi';
import Web3 from 'web3';
import { ethers } from 'ethers';
import { ErrorHandler } from '@vesper-discord/errors';
import { Config } from './config';
import { EthersErrorConverter } from './errors';

@Service()
export class BlockchainService {
  @Inject(() => Config)
  private config!: Config;

  public get web3() {
    const infuraUrl = `https://${this.config.network}.infura.io/v3/${this.config.infura.project.id}`;
    const httpProvider = new Web3.providers.HttpProvider(infuraUrl);
    return new Web3(httpProvider);
  }

  public get ethersProvider() {
    return new ethers.providers.InfuraProvider(this.config.network, {
      projectId: this.config.infura.project.id,
      projectSecret: this.config.infura.project.secret,
    });
  }

  /**
   * Prase the transaction receipt to get the log data
   */
  @ErrorHandler({ converter: EthersErrorConverter })
  public parseTransactionLog(contractInterface: ethers.utils.Interface, log: { topics: Array<string>; data: string }) {
    return contractInterface.parseLog(log);
  }
}
