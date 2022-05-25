import { SnowtraceService } from '@vesper-discord/blockchain-scan-service';
import { AvalancheBlockchainService } from '@vesper-discord/blockchain-service';
import { PlatformId } from '@vesper-discord/coin-gecko-service';
import { Inject, Service } from 'typedi';
import { AvalancheVesperService } from '../avalanche-service';
import { RewardAddedEventHandler } from './reward-added-event-handler';

@Service()
export class AvalancheRewardAddedEventHandler extends RewardAddedEventHandler {
  @Inject(() => AvalancheVesperService)
  protected readonly vesperService!: AvalancheVesperService;

  @Inject(() => AvalancheBlockchainService)
  protected readonly blockchainService!: AvalancheBlockchainService;

  @Inject(() => SnowtraceService)
  protected readonly blockchainScanService!: SnowtraceService;

  protected get network() {
    return 'avalanche';
  }

  protected get coingeckoPlatformId() {
    return PlatformId.AVALANCHE;
  }
}
