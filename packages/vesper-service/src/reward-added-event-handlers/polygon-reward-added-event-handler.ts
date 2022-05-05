import { PolygonScanService } from '@vesper-discord/blockchain-scan-service';
import { PolygonBlockchainService } from '@vesper-discord/blockchain-service';
import { PlatformId } from '@vesper-discord/coin-gecko-service';
import { Inject, Service } from 'typedi';
import { RewardAddedEventHandler } from './reward-added-event-handler';

@Service()
export class PolygonRewardAddedEventHandler extends RewardAddedEventHandler {
  @Inject(() => PolygonBlockchainService)
  protected readonly blockchainService!: PolygonBlockchainService;

  @Inject(() => PolygonScanService)
  protected readonly blockchainScanService!: PolygonScanService;

  protected get network() {
    return 'polygon';
  }

  protected get coingeckoPlatformId() {
    return PlatformId.POLYGON;
  }
}
