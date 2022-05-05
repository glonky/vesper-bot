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

    await this.container.get(EthereumRewardAddedEventHandler).backfill({ force, poolContractVersion: 3 });
    await this.container.get(EthereumRewardAddedEventHandler).backfill({ force, poolContractVersion: 4 });
    // await this.container.get(AvalancheRewardAddedEventHandler).backfill();
    // await this.container.get(PolygonRewardAddedEventHandler).backfill();

    this.logger.info(`Upserting reward amount`, {
      contractAddress,
    });
  }
}
