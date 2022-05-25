import { flags } from '@oclif/command';
import { EthereumRewardAddedEventHandler } from '@vesper-discord/vesper-service';
import { BaseCommand } from '../base-command';
// import { AvalancheRewardAddedEventHandler } from './reward-added-event-handlers/avalanche-reward-added-event-handler';
// import { PolygonRewardAddedEventHandler } from './reward-added-event-handlers/polygon-reward-added-event-handler';

export default class BackfillRewardAddedEvents extends BaseCommand {
  static flags = {
    contractAddress: flags.string({
      char: 'a',
      description: 'The contract address to read events on.',
    }),
    force: flags.boolean({
      char: 'f',
      description: 'Force backfill instead of starting from the last pool reward for the network.',
    }),
  };

  async runHandler() {
    const { flags: cliFlags } = this.parse(BackfillRewardAddedEvents);

    const { contractAddress, force } = cliFlags;

    await this.container.get(EthereumRewardAddedEventHandler).backfill({
      force,
      // fromBlockNumber: 14798068,
      // poolAddress: '0x7a74B6D3A07D3249Ea2FBb58e47F0DaF6d6a2ebf',
      poolContractVersion: 3,
      // toBlockNumber: 14798068,
    });
    await this.container.get(EthereumRewardAddedEventHandler).backfill({
      force,
      // fromBlockNumber: 14798068,
      // poolAddress: '0x7a74B6D3A07D3249Ea2FBb58e47F0DaF6d6a2ebf',
      poolContractVersion: 4,
      // toBlockNumber: 14798068,
    });
    // await this.container.get(AvalancheRewardAddedEventHandler).backfill();
    // await this.container.get(PolygonRewardAddedEventHandler).backfill({ force, poolContractVersion: 3 });
    // await this.container.get(PolygonRewardAddedEventHandler).backfill({ force, poolContractVersion: 4 });

    this.logger.info(`Upserting reward amount`, {
      contractAddress,
    });
  }
}
