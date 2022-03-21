import Container from 'typedi';
import { EtherscanService } from '@vesper-discord/etherscan-service';
import { ethers } from 'ethers';
import { BaseCommand } from '../base-command';

export default class TestCommand extends BaseCommand {
  static flags = {};

  async runHandler() {
    const etherscanService = Container.get(EtherscanService);
    const proxyAddress = '0x9B11078F5e8345d074498a83C4f9824942F796d3';
    const listOfNormalTransactionsByAddress = await etherscanService.getListOfNormalTransactionsByAddress({
      address: proxyAddress,
      sort: 'desc',
    });
    const { result } = listOfNormalTransactionsByAddress;
    const [firstTransaction] = result;

    const receipt = await etherscanService.getTransactionReceipt(firstTransaction.hash);
    const parsedLogs = await etherscanService.parseTransactionReceiptLogs(receipt);

    parsedLogs.filter(Boolean).forEach((parsedLog) => {
      if (!parsedLog) {
        return;
      }
      const filteredArgs = Object.entries(parsedLog.args).filter(([key]) => !Number.isInteger(Number(key)));

      const convertedArgs = filteredArgs.map(([key, value]) => {
        if (ethers.BigNumber.isBigNumber(value)) {
          const ether = ethers.utils.formatEther(value.toString());
          const currencyFormatter = new Intl.NumberFormat('en-US', {
            currency: 'USD',
            maximumFractionDigits: 20,
            style: 'currency',
          });

          return { [key]: currencyFormatter.format(Number(ether)) };
        }
        return { [key]: value };
      });

      this.logger.info('Parsed Log', {
        args: convertedArgs,
        name: parsedLog.name,
      });
    });
  }
}
