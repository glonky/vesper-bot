import { flags } from '@oclif/command';
import { EtherscanService } from '@vesper-discord/blockchain-scan-service';
import { EthereumBlockchainService } from '@vesper-discord/blockchain-service';
import { BaseCommand } from '../base-command';

export default class GetContractLogsCommand extends BaseCommand {
  static flags = {
    contractAddress: flags.string({
      char: 'a',
      description: 'The contract address to read events on.',
      required: true,
    }),
  };

  async runHandler() {
    const { flags: cliFlags } = this.parse(GetContractLogsCommand);

    const { contractAddress } = cliFlags;

    const etherscanService = this.container.get(EtherscanService);
    const blockchainService = this.container.get(EthereumBlockchainService);
    const contract = await etherscanService.getContractFromAddress(contractAddress);
    const filter = contract.filters.RewardAdded();
    const logs = await blockchainService.getLogs({ ...filter, fromBlock: 0, toBlock: 'latest' });
    const parsedLogs = await Promise.all(
      logs.map(async (log: any) => ({
        ...log,
        block: await blockchainService.getBlockInfo(log.blockNumber),
        parsedLog: blockchainService.parseTransactionLog(contract.interface, log),
      })),
    );

    this.logger.info(`Reading events`, {
      contractAddress,
      filter,
      parsedLogs,
    });
  }
}
