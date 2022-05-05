import { flags } from '@oclif/command';
import Container from 'typedi';
import { EtherscanService } from '@vesper-discord/etherscan-service';
import { BlockchainService } from '@vesper-discord/blockchain-service';
import { BaseCommand } from '../base-command';

export default class CallBlockchainMethodCommand extends BaseCommand {
  static flags = {
    contractAddress: flags.string({
      char: 'a',
      description: 'The contract address to call the method.',
      required: true,
    }),
    method: flags.string({
      char: 'm',
      description: 'The method on the contract to call',
      required: true,
    }),
    params: flags.string({
      char: 'p',
      description: 'The parameters to pass to the method.',
      multiple: true,
    }),
    readWrite: flags.string({
      char: 'r',
      default: 'read',
      description: 'The read/write permission for the method.',
      options: ['read', 'write'],
      required: true,
    }),
  };

  async runHandler() {
    const { flags: cliFlags } = this.parse(CallBlockchainMethodCommand);

    const { contractAddress, method, readWrite, params } = cliFlags;

    const abi = await Container.get(EtherscanService).getContractABIFromAddress({ contractAddress, followProxy: true });
    await Container.get(BlockchainService).callMethod({
      abi,
      cache: true,
      contractAddress,
      methodName: method,
      params,
      readWrite: readWrite as 'read' | 'write',
    });
  }
}