import { EtherscanService } from '@vesper-discord/blockchain-scan-service';
import { EthereumBlockchainService } from '@vesper-discord/blockchain-service';
import { PlatformId } from '@vesper-discord/coin-gecko-service';
import { Inject, Service } from 'typedi';
import { RewardAddedEventHandler } from './reward-added-event-handler';

@Service()
export class EthereumRewardAddedEventHandler extends RewardAddedEventHandler {
  @Inject(() => EthereumBlockchainService)
  protected readonly blockchainService!: EthereumBlockchainService;

  @Inject(() => EtherscanService)
  protected readonly blockchainScanService!: EtherscanService;

  protected get network() {
    return 'mainnet';
  }

  protected get coingeckoPlatformId() {
    return PlatformId.ETHEREUM;
  }
}
